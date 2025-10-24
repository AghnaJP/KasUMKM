// supabase/functions/login/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import bcrypt from 'https://esm.sh/bcryptjs'

// ⚙️ ambil environment variable
const url = Deno.env.get('PROJECT_URL')!
const serviceRole = Deno.env.get('PROJECT_SERVICE_ROLE')!

// inisialisasi supabase client (pakai service role)
const sb = createClient(url, serviceRole, { auth: { persistSession: false } })

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    // 📥 ambil body request
    const { phone, password } = await req.json()

    // validasi input
    if (!phone || !password) {
      return new Response(JSON.stringify({ error: 'missing_fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // cari user berdasarkan nomor hp
    const { data: user, error: userErr } = await sb
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single()

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'invalid_credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // verifikasi password hash
    const passwordMatch = bcrypt.compareSync(password, user.password_hash)
    if (!passwordMatch) {
      return new Response(JSON.stringify({ error: 'invalid_credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // ambil memberships user (untuk tau role & company)
    const { data: memberships = [] } = await sb
      .from('memberships')
      .select('company_id, role')
      .eq('user_id', user.id)

    const owner = memberships.find((m: any) => m.role === 'OWNER')
    const default_company_id = (owner || memberships[0])?.company_id ?? null
    const default_role = (owner || memberships[0])?.role ?? null

    // ✅ buat token random untuk disimpan di sisi client
    const token = crypto.randomUUID()

    // kirim response ke app
    return new Response(
      JSON.stringify({
        ok: true,
        token, // ⬅⬅⬅ penting: ini yang dibaca app kamu
        user: { id: user.id, name: user.name, phone: user.phone },
        memberships,
        default_company_id,
        default_role,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  } catch (e) {
    console.error('[login]', e)
    return new Response(
      JSON.stringify({
        error: 'login_failed',
        message: e?.message ?? String(e),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
})
