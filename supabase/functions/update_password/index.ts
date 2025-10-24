import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcryptjs';

const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method !== 'PUT') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { phone, old_password, new_password } = body || {};

    if (!phone || !old_password || !new_password) {
      return new Response(JSON.stringify({ error: 'missing_fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: user, error: eUser } = await sb
      .from('users')
      .select('id, password_hash')
      .eq('phone', String(phone).trim())
      .single();

    if (eUser || !user) {
      return new Response(JSON.stringify({ error: 'invalid_old_password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const ok = await bcrypt.compare(String(old_password), user.password_hash);
    if (!ok) {
      return new Response(JSON.stringify({ error: 'invalid_old_password' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const newHash = await bcrypt.hash(String(new_password), 10);
    const { error: eUpd } = await sb
      .from('users')
      .update({ password_hash: newHash })
      .eq('id', user.id);

    if (eUpd) {
      console.error('[update-password] update failed:', eUpd);
      return new Response(JSON.stringify({ error: 'update_failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[update-password]', e);
    return new Response(
      JSON.stringify({ error: 'update_failed', message: (e as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
