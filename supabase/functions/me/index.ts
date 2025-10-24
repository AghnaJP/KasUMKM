import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

function getSessionId(req: Request) {
  const h = req.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;

  try {
    // ===== GET /me (versi standar: wajib Authorization) =====
    if (pathname === '/me' && req.method === 'GET') {
      const sid = getSessionId(req);
      if (!sid) {
        return new Response(JSON.stringify({ error: 'missing_token' }), { status: 401 });
      }

      const now = new Date().toISOString();
      const { data: session } = await supabase
        .from('sessions')
        .select('id, user_id, expires_at')
        .eq('id', sid)
        .gt('expires_at', now)
        .single();

      if (!session) {
        return new Response(JSON.stringify({ error: 'invalid_or_expired_session' }), { status: 401 });
      }

      const { data: user } = await supabase
        .from('users')
        .select('id, name, phone, created_at')
        .eq('id', session.user_id)
        .single();

      const { data: memberships = [] } = await supabase
        .from('memberships')
        .select('company_id, role, created_at')
        .eq('user_id', user.id);

      let default_company_id: string | null = null;
      let default_role: string | null = null;
      if (memberships.length) {
        const owner = memberships.find((m) => m.role === 'OWNER');
        const pick = owner || memberships[0];
        default_company_id = pick.company_id;
        default_role = pick.role;
      }

      return new Response(JSON.stringify({
        ok: true,
        user,
        memberships,
        default_company_id,
        default_role,
        session: { id: session.id, expires_at: session.expires_at },
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // ===== PUT /me (boleh Authorization ATAU fallback by phone) =====
    if (pathname === '/me' && req.method === 'PUT') {
      const sid = getSessionId(req);
      const body = await req.json().catch(() => ({}));
      const rawName = (body?.name ?? '').toString();
      const phone = (body?.phone ?? '').toString().trim();

      if (!rawName.trim()) {
        return new Response(JSON.stringify({ error: 'name_required' }), { status: 400 });
      }
      const trimmedName = rawName.trim();
      if (trimmedName.length > 255) {
        return new Response(JSON.stringify({ error: 'name_too_long' }), { status: 400 });
      }

      // Mode 1: ada Authorization -> verifikasi session dan update by user_id
      if (sid) {
        const now = new Date().toISOString();
        const { data: session } = await supabase
          .from('sessions')
          .select('id, user_id, expires_at')
          .eq('id', sid)
          .gt('expires_at', now)
          .single();

        if (!session) {
          return new Response(JSON.stringify({ error: 'invalid_or_expired_session' }), { status: 401 });
        }

        const { error: eUpd } = await supabase
          .from('users')
          .update({ name: trimmedName })
          .eq('id', session.user_id);

        if (eUpd) {
          return new Response(JSON.stringify({ error: 'update_failed', message: eUpd.message }), { status: 500 });
        }

        const { data: user } = await supabase
          .from('users')
          .select('id, name, phone')
          .eq('id', session.user_id)
          .single();

        return new Response(JSON.stringify({
          success: true,
          message: 'User name updated successfully',
          user,
        }), { headers: { 'Content-Type': 'application/json' } });
      }

      // Mode 2: TANPA Authorization -> langsung update by phone
      if (!phone) {
        return new Response(JSON.stringify({ error: 'missing_token_or_phone' }), { status: 401 });
      }

      const { error: eUpdPhone } = await supabase
        .from('users')
        .update({ name: trimmedName })
        .eq('phone', phone);

      if (eUpdPhone) {
        return new Response(JSON.stringify({ error: 'update_failed', message: eUpdPhone.message }), { status: 500 });
      }

      const { data: user } = await supabase
        .from('users')
        .select('id, name, phone')
        .eq('phone', phone)
        .single();

      return new Response(JSON.stringify({
        success: true,
        message: 'User name updated successfully',
        user,
      }), { headers: { 'Content-Type': 'application/json' } });
    }


    return new Response('Not Found', { status: 404 });
  } catch (e) {
    console.error('[me]', e);
    return new Response(JSON.stringify({ error: 'me_failed', message: (e as Error).message }), { status: 500 });
  }
});
