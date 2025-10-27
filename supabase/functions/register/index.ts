import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import bcrypt from 'https://esm.sh/bcryptjs';

// ⚙️ pakai env BARU, bukan SUPABASE_*
const url = Deno.env.get('SUPABASE_URL')!;
const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const sb = createClient(url, serviceRole, { auth: { persistSession: false } });

serve(async (req) => {
  if (req.method !== 'POST')
    {return new Response('Method not allowed', { status: 405 });}

  try {
    const { name, phone, password, invite_code } = await req.json();
    if (!name || !phone || !password)
      {return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400 });}

    const password_hash = await bcrypt.hash(password, 10);
    let invite: any = null;

    // cek kode undangan (optional)
    if (invite_code?.trim()) {
      const now = new Date().toISOString();
      const { data, error } = await sb
        .from('invite_codes')
        .select('*')
        .eq('code', invite_code.trim().toUpperCase())
        .gt('expires_at', now)
        .single();
      if (error || !data)
        {return new Response(JSON.stringify({ error: 'invalid_or_expired_invite' }), { status: 400 });}
      invite = data;
    }

    // buat user baru
    const { data: user, error: eUser } = await sb
      .from('users')
      .insert({ name, phone, password_hash })
      .select()
      .single();
    if (eUser) {
      if (eUser.code === '23505')
        {return new Response(JSON.stringify({ error: 'phone_already_used' }), { status: 409 });}
      throw eUser;
    }

    // assign membership & company
    let company: any = null;
    let membership: any = null;

    if (invite) {
      const { data: mem } = await sb
        .from('memberships')
        .insert({
          user_id: user.id,
          company_id: invite.company_id,
          role: invite.role || 'CASHIER',
        })
        .select()
        .single();
      membership = mem;
      await sb.from('invite_codes').delete().eq('code', invite.code);
      const { data: comp } = await sb
        .from('companies')
        .select('*')
        .eq('id', invite.company_id)
        .single();
      company = comp;
    } else {
      const companyName = `${name}'s Company`;
      const { data: comp } = await sb
        .from('companies')
        .insert({ name: companyName })
        .select()
        .single();
      company = comp;
      const { data: mem } = await sb
        .from('memberships')
        .insert({ user_id: user.id, company_id: company.id, role: 'OWNER' })
        .select()
        .single();
      membership = mem;
    }

    // 🚫 tidak ada insert ke tabel sessions di sini
    // token akan dibuat di client (app) pakai JWT Supabase Auth nanti

    return new Response(
      JSON.stringify({
        ok: true,
        user: { id: user.id, name: user.name, phone: user.phone },
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
