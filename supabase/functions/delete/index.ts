import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const ct = { 'Content-Type': 'application/json' };

serve(async (req) => {
  const url = new URL(req.url);

  if (url.pathname !== '/delete' || req.method !== 'DELETE') {
    return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: ct });
  }

  try {
    const phone = (url.searchParams.get('user_phone') ?? '').trim();
    if (!phone) {
      return new Response(JSON.stringify({ error: 'missing_phone' }), { status: 400, headers: ct });
    }

    const { data: user, error: eUser } = await sb
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (eUser || !user) {
      return new Response(JSON.stringify({ error: 'user_not_found' }), { status: 404, headers: ct });
    }

    const { error: eMem } = await sb.from('memberships').delete().eq('user_id', user.id);
    if (eMem) {
      console.warn('[delete] memberships delete error:', eMem);
      return new Response(JSON.stringify({ error: 'delete_failed', message: eMem.message }), {
        status: 500, headers: ct,
      });
    }

    const { error: eDel } = await sb.from('users').delete().eq('id', user.id);
    if (eDel) {
      return new Response(JSON.stringify({ error: 'delete_failed', message: eDel.message }), {
        status: 500, headers: ct,
      });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: ct });
  } catch (e) {
    console.error('[delete]', e);
    return new Response(JSON.stringify({ error: 'delete_failed', message: (e as Error).message }), {
      status: 500, headers: ct,
    });
  }
});
