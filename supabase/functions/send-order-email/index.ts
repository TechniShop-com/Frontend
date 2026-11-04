import { createClient } from 'npm:@supabase/supabase-js@2.118.0';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const respond = (status: number, body: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers });

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character] ?? character));

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed' });

  const authorization = request.headers.get('Authorization') ?? '';
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) return respond(401, { error: 'Authentication required' });
  const url = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!url || !anonKey) return respond(500, { error: 'Service not configured' });
  const client = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    const { data: { user }, error: authError } = await client.auth.getUser(token);
    if (authError || !user) return respond(401, { error: 'Invalid session' });
    const payload = await request.json();
    if (!['number', 'string'].includes(typeof payload?.orderId)) return respond(400, { error: 'Missing order ID' });

    // Fetch through RLS, including the active-session policy, and require
    // ownership even if the caller also has an administrator role.
    const { data: order, error } = await client.from('orders')
      .select('id, user_id, customerName, email, totalPrice, items')
      .eq('id', payload.orderId).eq('user_id', user.id).maybeSingle();
    if (error || !order) return respond(403, { error: 'Order not available' });
    if (!apiKey) return respond(500, { error: 'Service not configured' });

    const rawItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
    const items = (Array.isArray(rawItems) ? rawItems : [])
      .map((item) => `<li>${escapeHtml(item.product?.title || 'Produkt')} × ${escapeHtml(item.quantity || 1)}</li>`).join('');
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'TechniShop <onboarding@resend.dev>',
        to: [order.email],
        subject: `Potwierdzenie zamówienia #${order.id}`,
        html: `<h1>Dziękujemy za zamówienie, ${escapeHtml(order.customerName)}!</h1><p>Numer zamówienia: <strong>#${escapeHtml(order.id)}</strong></p><ul>${items}</ul><p>Razem: <strong>${Number(order.totalPrice).toFixed(2)} zł</strong></p>`,
      }),
    });
    return new Response(await result.text(), { status: result.status, headers });
  } catch (error) {
    console.error('send-order-email failed', error instanceof Error ? error.message : 'unknown error');
    return respond(500, { error: 'Could not send email' });
  }
});
