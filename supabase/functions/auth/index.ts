import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

serve(async (req) => {
  try {
    const h = req.headers.get('authorization') || '';
    const m = /^Bearer\s+(.+)$/i.exec(h.trim());

    if (!m) {
      return new Response(JSON.stringify({ error: 'auth_error' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const sessionId = m[1];
    const now = new Date().toISOString();

    const { data: session, error } = await sb
      .from('sessions')
      .select('id, user_id, expires_at')
      .eq('id', sessionId)
      .gt('expires_at', now)
      .single();

    if (error || !session) {
      return new Response(JSON.stringify({ error: 'auth_error' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        user_id: session.user_id,
        session_id: session.id,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: 'server_error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
