import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// setup supabase client pakai environment bawaan Supabase Edge
const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
// helper: ambil session_id dari Authorization header
function getSessionId(req) {
  const h = req.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}
serve(async (req)=>{
  const url = new URL(req.url);
  const pathname = url.pathname;
  try {
    if (pathname === '/me' && req.method === 'GET') {
      const sid = getSessionId(req);
      if (!sid) {
        return new Response(JSON.stringify({
          error: 'missing_token',
        }), {
          status: 401,
        });
      }
      const now = new Date().toISOString();
      const { data: session } = await supabase.from('sessions').select('id, user_id, expires_at').eq('id', sid).gt('expires_at', now).single();
      if (!session) {
        return new Response(JSON.stringify({
          error: 'invalid_or_expired_session',
        }), {
          status: 401,
        });
      }
      const { data: user } = await supabase.from('users').select('id, name, phone, created_at').eq('id', session.user_id).single();
      const { data: memberships = [] } = await supabase.from('memberships').select('company_id, role, created_at').eq('user_id', user.id);
      let default_company_id = null;
      let default_role = null;
      if (memberships.length) {
        const owner = memberships.find((m)=>m.role === 'OWNER');
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
        session: {
          id: session.id,
          expires_at: session.expires_at,
        },
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    if (pathname === '/me' && req.method === 'PUT') {
      const sid = getSessionId(req);
      if (!sid) {
        return new Response(JSON.stringify({
          error: 'missing_token',
        }), {
          status: 401,
        });
      }
      // Ambil session untuk verifikasi
      const now = new Date().toISOString();
      const { data: session } = await supabase.from('sessions').select('id, user_id, expires_at').eq('id', sid).gt('expires_at', now).single();
      if (!session) {
        return new Response(JSON.stringify({
          error: 'invalid_or_expired_session',
        }), {
          status: 401,
        });
      }
      const body = await req.json();
      const { name } = body;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return new Response(JSON.stringify({
          error: 'name_required',
        }), {
          status: 400,
        });
      }
      const trimmedName = name.trim();
      if (trimmedName.length > 255) {
        return new Response(JSON.stringify({
          error: 'name_too_long',
        }), {
          status: 400,
        });
      }
      // Update nama user
      const { error: updateError } = await supabase.from('users').update({
        name: trimmedName,
      }).eq('id', session.user_id);
      if (updateError) {
        return new Response(JSON.stringify({
          error: 'update_failed',
          message: updateError.message,
        }), {
          status: 500,
        });
      }
      // Ambil user terbaru
      const { data: user, error: userError } = await supabase.from('users').select('id, name, phone').eq('id', session.user_id).single();
      if (userError || !user) {
        return new Response(JSON.stringify({
          error: 'user_not_found',
        }), {
          status: 404,
        });
      }
      return new Response(JSON.stringify({
        success: true,
        message: 'User name updated successfully',
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
        },
      }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
    return new Response('Not Found', {
      status: 404,
    });
  } catch (e) {
    console.error('[me]', e);
    return new Response(JSON.stringify({
      error: 'me_failed',
      message: e.message,
    }), {
      status: 500,
    });
  }
});
