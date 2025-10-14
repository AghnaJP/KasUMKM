import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcryptjs';

// setup supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  try {
    const { phone, password } = await req.json();
    if (!phone || !password) {
      return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400 });
    }

    // Cari user berdasarkan phone
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      return new Response(JSON.stringify({ error: 'invalid_credentials' }), { status: 401 });
    }

    // Bandingkan password hash menggunakan bcryptjs
    const passwordMatch = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'invalid_credentials' }), { status: 401 });
    }

    // Buat session baru
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const { data: session, error: eSess } = await supabase
      .from('sessions')
      .insert({ user_id: user.id, expires_at: expiresAt })
      .select()
      .single();

    if (eSess || !session) {
      return new Response(JSON.stringify({ error: 'create_session_failed' }), { status: 500 });
    }

    // Ambil memberships
    const { data: memberships = [] } = await supabase
      .from('memberships')
      .select('company_id, role, created_at')
      .eq('user_id', user.id);

    let default_company_id = null;
    let default_role = null;
    if (memberships.length) {
      const owner = memberships.find((m) => m.role === 'OWNER');
      const pick = owner || memberships[0];
      default_company_id = pick.company_id;
      default_role = pick.role;
    }

    return new Response(JSON.stringify({
      ok: true,
      token: session.id,
      expires_at: session.expires_at,
      user: { id: user.id, name: user.name, phone: user.phone },
      memberships,
      default_company_id,
      default_role,
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (e) {
    console.error('[login]', e);
    return new Response(JSON.stringify({ error: 'login_failed' }), { status: 500 });
  }
});
