import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcryptjs';

// Supabase client
const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const { name, phone, password, invite_code } = body || {};

    if (!name || !phone || !password) {
      return new Response(JSON.stringify({ error: 'missing_fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Check invite code
    let invite: any = null;
    if (invite_code && String(invite_code).trim()) {
      const now = new Date().toISOString();
      const { data, error } = await sb
        .from('invite_codes')
        .select('*')
        .eq('code', String(invite_code).trim().toUpperCase())
        .gt('expires_at', now)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'invalid_or_expired_invite' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      invite = data;
    }

    // Insert user
    const { data: user, error: eUser } = await sb
      .from('users')
      .insert({ name, phone, password_hash })
      .select()
      .single();

    if (eUser) {
      if (eUser.code === '23505') {
        return new Response(JSON.stringify({ error: 'phone_already_used' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      throw eUser;
    }

    let company: any = null;
    let membership: any = null;

    if (invite) {
      // Assign membership from invite
      const { data: mem, error: eMem } = await sb
        .from('memberships')
        .insert({
          user_id: user.id,
          company_id: invite.company_id,
          role: invite.role || 'CASHIER',
        })
        .select()
        .single();
      if (eMem) {throw eMem;}
      membership = mem;

      await sb.from('invite_codes').delete().eq('code', invite.code);

      const { data: comp } = await sb
        .from('companies')
        .select('*')
        .eq('id', invite.company_id)
        .single();
      company = comp || null;
    } else {
      // Buat company baru
      const companyName = `${name}'s Company`;
      const { data: comp, error: eComp } = await sb
        .from('companies')
        .insert({ name: companyName })
        .select()
        .single();
      if (eComp) {throw eComp;}
      company = comp;

      const { data: mem, error: eMem } = await sb
        .from('memberships')
        .insert({ user_id: user.id, company_id: company.id, role: 'OWNER' })
        .select()
        .single();
      if (eMem) {throw eMem;}
      membership = mem;
    }

    // Buat session UUID
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
    const { data: session, error: eSess } = await sb
      .from('sessions')
      .insert({ user_id: user.id, expires_at: expiresAt })
      .select()
      .single();
    if (eSess) {
      console.warn('[register] create session failed:', eSess);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        token: session?.id ?? null,
        expires_at: session?.expires_at ?? null,
        user: {
          id: user.id,
          name: user.name,
          phone: user.phone,
          created_at: user.created_at,
        },
        company,
        membership,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('[register]', e);
    return new Response(JSON.stringify({ error: 'register_failed', message: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
