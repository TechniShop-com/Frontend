import { createClient } from '@supabase/supabase-js';
import { pathToFileURL } from 'node:url';

// Only run in a trusted environment with a service role key; never in a browser.
export async function restoreAccount(admin, userId) {
  const claimTime = new Date().toISOString();
  const { data: claim, error: claimError } = await admin.from('profiles')
    .update({ restoration_started_at: claimTime })
    .eq('id', userId).eq('is_deleted', true)
    .not('deactivation_completed_at', 'is', null).is('restoration_started_at', null)
    .select('id').maybeSingle();
  if (claimError) throw claimError;
  if (!claim) throw new Error('Account is not ready for restoration or another restoration is in progress');

  try {
    const { error: authError } = await admin.auth.admin.updateUserById(userId, { ban_duration: 'none' });
    if (authError) throw authError;
    const { data, error } = await admin.from('profiles')
      .update({ is_deleted: false, restoration_started_at: null })
      .eq('id', userId).eq('is_deleted', true).eq('restoration_started_at', claimTime)
      .select('id').maybeSingle();
    if (error) throw error;
    if (!data) throw new Error('Restoration state changed unexpectedly');
  } catch (error) {
    // A failed or interrupted restoration stays blocked in the database.
    // If re-banning fails, leave the claim for an operator to reconcile.
    // An API timeout does not prove that the unban failed on the server.
    const { error: banError } = await admin.auth.admin.updateUserById(userId, { ban_duration: '876000h' });
    const safeToRelease = !banError;
    if (safeToRelease) {
      await admin.from('profiles').update({ restoration_started_at: null })
        .eq('id', userId).eq('is_deleted', true).eq('restoration_started_at', claimTime);
    }
    throw error;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const userId = process.argv[2];
  const url = process.env.TECHNISHOP_SUPABASE_URL;
  const key = process.env.TECHNISHOP_SUPABASE_SERVICE_ROLE_KEY;
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) || !url || !key) {
    console.error('Usage: set TECHNISHOP_SUPABASE_URL and TECHNISHOP_SUPABASE_SERVICE_ROLE_KEY, then run node scripts/restore-account.mjs <user-uuid>');
    process.exitCode = 1;
  } else {
    const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    try {
      await restoreAccount(admin, userId);
      console.log('Account restored. All sessions created before restoration remain blocked.');
    } catch (error) {
      console.error('Restoration failed:', error instanceof Error ? error.message : 'unknown error');
      process.exitCode = 1;
    }
  }
}
