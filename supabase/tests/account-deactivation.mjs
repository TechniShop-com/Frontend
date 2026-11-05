// Run against the isolated local fixture only, never a hosted project.
import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { restoreAccount } from '../../scripts/restore-account.mjs';

const status = JSON.parse(execSync('npx supabase status -o json', { encoding: 'utf8' }));
const url = new URL(status.API_URL);
assert.equal(url.hostname, '127.0.0.1', 'Tests require the isolated local Supabase instance');
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url.href, status.SERVICE_ROLE_KEY, options);
const makeClient = () => createClient(url.href, status.ANON_KEY, options);
const identifier = randomUUID();
const email = `test-${identifier}@example.invalid`;
const password = `Test-${randomUUID()}!`;
let userId;
let otherUserId;

try {
  const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  assert.ifError(created.error);
  userId = created.data.user.id;
  assert.ifError((await admin.from('profiles').insert({ id: userId, email, name: 'Local test' })).error);

  const first = makeClient();
  const second = makeClient();
  assert.ifError((await first.auth.signInWithPassword({ email, password })).error);
  assert.ifError((await second.auth.signInWithPassword({ email, password })).error);
  const oldToken = (await second.auth.getSession()).data.session.access_token;
  assert.equal((await first.from('profiles').select('id').single()).data.id, userId);

  const directChange = await first.from('profiles').update({ is_deleted: true }).eq('id', userId);
  assert.ok(directChange.error, 'Client must not be allowed to change is_deleted');
  const forbiddenRpc = await first.rpc('begin_account_deactivation', { p_user_id: userId, p_session_id: randomUUID() });
  assert.ok(forbiddenRpc.error, 'Client must not call privileged deactivation RPC');

  const inserted = await first.from('orders').insert({ user_id: userId, customerName: 'Local test', email, totalPrice: 12, items: [] }).select().single();
  assert.ifError(inserted.error);
  const orderId = inserted.data.id;
  assert.ifError((await first.from('cart_items').insert({ user_id: userId })).error);
  const otherEmail = `other-${identifier}@example.invalid`;
  const otherCreated = await admin.auth.admin.createUser({ email: otherEmail, password, email_confirm: true });
  assert.ifError(otherCreated.error);
  otherUserId = otherCreated.data.user.id;
  assert.ifError((await admin.from('profiles').insert({ id: otherUserId, email: otherEmail, name: 'Other local test' })).error);
  assert.ifError((await admin.from('admin_users').insert({ user_id: otherUserId })).error);
  const other = makeClient();
  assert.ifError((await other.auth.signInWithPassword({ email: otherEmail, password })).error);
  assert.equal((await other.from('orders').select('id').eq('id', orderId)).data?.length, 0, 'Another account must not read the order');

  const response = await first.functions.invoke('deactivate-account');
  assert.ifError(response.error);
  assert.equal(response.data?.status, 'completed');
  const profile = await admin.from('profiles').select('is_deleted, deleted_at, deactivation_completed_at').eq('id', userId).single();
  assert.ifError(profile.error);
  assert.equal(profile.data.is_deleted, true);
  assert.ok(profile.data.deleted_at && profile.data.deactivation_completed_at);
  assert.equal((await admin.from('orders').select('id').eq('id', orderId)).data.length, 1, 'Order must remain');
  assert.ok((await makeClient().auth.signInWithPassword({ email, password })).error, 'Deactivated account must not log in');
  assert.equal((await other.from('profiles').select('id').single()).data?.id, otherUserId, 'Another account must remain usable');
  assert.equal((await other.from('admin_users').select('user_id').single()).data?.user_id, otherUserId, 'Active admin membership must remain usable');

  const failingAdmin = {
    from: admin.from.bind(admin),
    auth: { admin: { updateUserById: async () => ({ error: new Error('Simulated Auth outage') }) } },
  };
  await assert.rejects(restoreAccount(failingAdmin, userId), /Simulated Auth outage/);
  const afterFailure = await admin.from('profiles').select('is_deleted, restoration_started_at').eq('id', userId).single();
  assert.equal(afterFailure.data.is_deleted, true, 'Failed restore must not activate the profile');
  assert.ok(afterFailure.data.restoration_started_at, 'Uncertain Auth state must retain the operator claim');
  // The fake outage did not change Auth; a trusted operator can reconcile it.
  assert.ifError((await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })).error);
  assert.ifError((await admin.from('profiles').update({ restoration_started_at: null }).eq('id', userId)).error);

  const stale = createClient(url.href, status.ANON_KEY, {
    ...options, global: { headers: { Authorization: `Bearer ${oldToken}` } },
  });
  assert.equal((await stale.from('orders').select('id')).data?.length ?? 0, 0, 'Old session must not read orders');
  assert.ok((await stale.from('cart_items').insert({ user_id: userId })).error, 'Old session must not write cart');
  const mail = await stale.functions.invoke('send-order-email', { body: { orderId } });
  assert.ok([401, 403].includes(mail.error?.context?.status), 'Old session must not send order email');

  // Simulate a session issued during a partially completed restore: it must
  // not gain access after restoration even if its JWT has not expired.
  assert.ifError((await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' })).error);
  const interim = makeClient();
  assert.ifError((await interim.auth.signInWithPassword({ email, password })).error);
  assert.equal((await interim.from('orders').select('id')).data?.length ?? 0, 0);
  const interimMail = await interim.functions.invoke('send-order-email', { body: { orderId } });
  assert.equal(interimMail.error?.context?.status, 403, 'Deleted account must not send order email');
  assert.ifError((await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' })).error);
  const attempts = await Promise.allSettled([restoreAccount(admin, userId), restoreAccount(admin, userId)]);
  assert.equal(attempts.filter((result) => result.status === 'fulfilled').length, 1, 'Only one concurrent restore may succeed');
  const restoredProfile = await admin.from('profiles').select('sessions_valid_after').eq('id', userId).single();
  assert.ok(restoredProfile.data.sessions_valid_after, 'Restoration must invalidate pre-restore sessions');
  const restored = makeClient();
  assert.ifError((await restored.auth.signInWithPassword({ email, password })).error);
  assert.equal((await restored.from('orders').select('id').eq('id', orderId)).data?.length, 1);
  assert.equal((await stale.from('orders').select('id')).data?.length ?? 0, 0, 'Old session must stay blocked after restore');
  assert.equal((await interim.from('orders').select('id')).data?.length ?? 0, 0, 'Interim session must stay blocked after restore');
  console.log('PASS: deactivation, protected columns, old sessions, preserved order, login and restoration');
} finally {
  if (userId) {
    await admin.from('cart_items').delete().eq('user_id', userId);
    await admin.from('orders').delete().eq('user_id', userId);
    await admin.from('profiles').delete().eq('id', userId);
    await admin.auth.admin.deleteUser(userId);
  }
  if (otherUserId) {
    await admin.from('admin_users').delete().eq('user_id', otherUserId);
    await admin.from('profiles').delete().eq('id', otherUserId);
    await admin.auth.admin.deleteUser(otherUserId);
  }
}
