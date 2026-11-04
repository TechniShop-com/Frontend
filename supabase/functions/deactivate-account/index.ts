import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function respond(status: number, body: Record<string, string>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' });

  const authorization = request.headers.get('Authorization') ?? '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return respond(401, { error: 'Authentication required' });

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return respond(500, { error: 'Service not configured' });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

  try {
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return respond(401, { error: 'Invalid session' });

    // getUser verified the JWT above; the database also checks this session
    // belongs to the authenticated user before changing the profile.
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (typeof payload.session_id !== 'string') return respond(401, { error: 'Invalid session' });

    const { error: beginError } = await admin.rpc('begin_account_deactivation', {
      p_user_id: user.id,
      p_session_id: payload.session_id,
    });
    if (beginError) return respond(409, { error: 'Could not start deactivation' });

    // Fail closed: once the profile is marked deleted, do not undo it on error.
    // Auth rejects the logout request for a banned user, so revoke first.
    const { error: logoutError } = await admin.auth.admin.signOut(token, 'global');
    if (logoutError) throw logoutError;
    const { error: banError } = await admin.auth.admin.updateUserById(user.id, { ban_duration: '876000h' });
    if (banError) throw banError;
    const { error: completionError } = await admin.rpc('complete_account_deactivation', { p_user_id: user.id });
    if (completionError) throw completionError;
    return respond(200, { status: 'completed' });
  } catch (error) {
    console.error('Account deactivation failed', error instanceof Error ? error.message : 'unknown error');
    return respond(500, { error: 'Deactivation could not be confirmed' });
  }
});
