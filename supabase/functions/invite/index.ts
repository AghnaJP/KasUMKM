import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase client
const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// --- Helper ---
function getSessionId(req: Request) {
  const h = req.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

async function getUserFromSession(req: Request) {
  const sid = getSessionId(req);
  if (!sid) {return { error: 'missing_token' };}

  const now = new Date().toISOString();
  const { data: session } = await sb
    .from('sessions')
    .select('id, user_id, expires_at')
    .eq('id', sid)
    .gt('expires_at', now)
    .single();

    if (!session) {return { error: 'invalid_or_expired_session' };}

  const { data: user } = await sb
    .from('users')
    .select('id, name')
    .eq('id', session.user_id)
    .single();

    return { user, session, error: null };
}

function genCode6() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function generateUniqueCode() {
  for (let i = 0; i < 8; i++) {
    const code = genCode6();
    const { count } = await sb
      .from('invite_codes')
      .select('code', { count: 'exact', head: true })
      .eq('code', code);

    if (!count || count === 0) {return code;}
  }
  return genCode6();
}

async function resolveOwnerCompanyId(user_id: string) {
  const { data: memberships = [] } = await sb
    .from('memberships')
    .select('company_id, role')
    .eq('user_id', user_id);

  const owner = memberships.find(m => m.role === 'OWNER');
  if (!owner) {throw new Error('owner_membership_not_found');}
  return owner.company_id;
}

// --- Edge Function ---
serve(async (req) => {
  try {
    const url = new URL(req.url);
    const pathname = url.pathname;
    const method = req.method;

    // POST /invite/create
if (pathname === '/invite/create' && method === 'POST') {
  // coba pakai session seperti biasa
  const { user, error } = await getUserFromSession(req);

  const body = await req.json().catch(() => ({}));
  const ttl = Number(body?.ttl_hours ?? 24);
  const expires_at = new Date(Date.now() + ttl * 3600 * 1000).toISOString();

  let company_id: string | null = null;

  if (!error && user) {
    // jalur normal: resolve company dari OWNER membership
    company_id = await resolveOwnerCompanyId(user.id);
  } else {
    // fallback sementara: terima company_id dari client
    const cid = String(body?.company_id || '').trim();
    if (!cid) {
      return new Response(
        JSON.stringify({ error: 'missing_token_or_company_id' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    company_id = cid;
  }

  const code = await generateUniqueCode();
  const { data, error: eIns } = await sb
    .from('invite_codes')
    .insert({ code, company_id, role: 'CASHIER', expires_at })
    .select()
    .single();

  if (eIns) {
    return new Response(JSON.stringify({ error: 'create_invite_failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      code: data.code,
      expires_at: data.expires_at,
      company_id,
      role: data.role,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}


    // GET /invite/verify/:code
    if (pathname.startsWith('/invite/verify/') && method === 'GET') {
      const code = pathname.replace('/invite/verify/', '').trim().toUpperCase();
      const now = new Date().toISOString();

      const { data: invite } = await sb
        .from('invite_codes')
        .select('*')
        .eq('code', code)
        .gt('expires_at', now)
        .single();

      if (!invite) {return new Response(JSON.stringify({ ok: true, valid: false }), { headers: { 'Content-Type': 'application/json' } });}

      return new Response(JSON.stringify({
        ok: true,
        valid: true,
        company_id: invite.company_id,
        role: invite.role,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Not Found', { status: 404 });
  } catch (e) {
    console.error('[invite_edge]', e);
    return new Response(JSON.stringify({ error: 'invite_edge_failed', message: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
