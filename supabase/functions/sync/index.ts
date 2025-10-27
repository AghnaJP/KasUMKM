import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Supabase client
const sb = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// ===================== Helpers =====================

function getSessionId(req: Request) {
  const h = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!h) {return null;}
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}

async function getUserFromSession(req: Request) {
  const sid = getSessionId(req);
  if (!sid) {return { error: 'missing_token' };}

  const now = new Date().toISOString();
  const { data: session } = await sb
    .from('sessions')
    .select('id,user_id,expires_at')
    .eq('id', sid)
    .gt('expires_at', now)
    .single();

  if (!session) {return { error: 'invalid_or_expired_session' };}

  const { data: user } = await sb
    .from('users')
    .select('id,name')
    .eq('id', session.user_id)
    .single();

  return { user, session, error: null };
}

async function assertMembership(user_id: string, company_id: string) {
  const { data: m, error } = await sb
    .from('memberships')
    .select('id')
    .eq('user_id', user_id)
    .eq('company_id', company_id)
    .maybeSingle();
  if (error) {throw error;}
  if (!m) {throw new Error('not_member_of_company');}
}

// ===================== Handlers =====================

async function handlePull(req: Request) {
  try {
    const { session, error } = await getUserFromSession(req);
    const url = new URL(req.url);
    const isPost = req.method === 'POST';
    const body = isPost ? await req.json().catch(() => ({})) : {};
    const company_id = String((isPost ? body?.company_id : url.searchParams.get('company_id')) || '').trim();
    const since = String((isPost ? body?.since : url.searchParams.get('since')) || '').trim() || '1970-01-01T00:00:00Z';

    if (!company_id) {return new Response(JSON.stringify({ error: 'missing_company_id' }), { status: 400 });}

    //await assertMembership(session.user_id, company_id);

    if (!error && session?.user_id) {
      await assertMembership(session.user_id, company_id);
    }

    const { data: menus, error: e1 } = await sb
      .from('menus')
      .select('*')
      .eq('company_id', company_id)
      .gte('updated_at', since)
      .order('updated_at', { ascending: true });
    if (e1) {throw e1;}

    const { data: txs, error: e2 } = await sb
      .from('transactions')
      .select('*')
      .eq('company_id', company_id)
      .gte('updated_at', since)
      .order('updated_at', { ascending: true });
    if (e2) {throw e2;}

    return new Response(
      JSON.stringify({
        ok: true,
        server_time: new Date().toISOString(),
        menus: menus ?? [],
        transactions: txs ?? [],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    if (e?.message === 'not_member_of_company') {
      return new Response(JSON.stringify({ error: 'not_member_of_company' }), { status: 403 });
    }
    console.error('[sync/pull]', e);
    return new Response(JSON.stringify({ error: 'sync_pull_failed' }), { status: 500 });
  }
}

async function handlePush(req: Request) {
  try {
    const { session, error } = await getUserFromSession(req);

    const body = await req.json();
    const {
      company_id,
      menus_upsert = [],
      menus_delete = [],
      transactions_upsert = [],
      transactions_delete = [],
    } = body || {};

    if (!company_id) {return new Response(JSON.stringify({ error: 'missing_company_id' }), { status: 400 });}
    if (!error && session?.user_id) {
      await assertMembership(session.user_id, company_id);
    }

    const nowIso = new Date().toISOString();
    const withCompanyAndUpdatedAt = (r: any) => ({
      ...r,
      company_id,
      updated_at: r?.updated_at ?? nowIso,
    });

    if (menus_upsert.length) {
      const payload = menus_upsert.map(withCompanyAndUpdatedAt);
      const { error: eM } = await sb.from('menus').upsert(payload, { onConflict: 'id' });
      if (eM) {
        console.error('[sync/push] menus_upsert error:', eM);
        return new Response(JSON.stringify({ error: 'menus_upsert_failed' }), { status: 500 });
      }
    }

    if (menus_delete.length) {
      const { error: eMD } = await sb
        .from('menus')
        .update({ deleted_at: nowIso, updated_at: nowIso })
        .eq('company_id', company_id)
        .in('id', menus_delete);
      if (eMD) {
        console.error('[sync/push] menus_delete error:', eMD);
        return new Response(JSON.stringify({ error: 'menus_delete_failed' }), { status: 500 });
      }
    }

    if (transactions_upsert.length) {
      const payload = transactions_upsert.map(withCompanyAndUpdatedAt);
      const { error: eT } = await sb.from('transactions').upsert(payload, { onConflict: 'id' });
      if (eT) {
        console.error('[sync/push] transactions_upsert error:', eT);
        return new Response(JSON.stringify({ error: 'transactions_upsert_failed' }), { status: 500 });
      }
    }

    if (transactions_delete.length) {
      const { error: eTD } = await sb
        .from('transactions')
        .update({ deleted_at: nowIso, updated_at: nowIso })
        .eq('company_id', company_id)
        .in('id', transactions_delete);
      if (eTD) {
        console.error('[sync/push] transactions_delete error:', eTD);
        return new Response(JSON.stringify({ error: 'transactions_delete_failed' }), { status: 500 });
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        server_time: nowIso,
        stats: {
          menus_upserted: menus_upsert.length,
          menus_deleted: menus_delete.length,
          transactions_upserted: transactions_upsert.length,
          transactions_deleted: transactions_delete.length,
        },
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    if (e?.message === 'not_member_of_company') {
      return new Response(JSON.stringify({ error: 'not_member_of_company' }), { status: 403 });
    }
    console.error('[sync/push]', e);
    return new Response(JSON.stringify({ error: 'sync_push_failed' }), { status: 500 });
  }
}

// ===================== Main Handler =====================

Deno.serve(async (req) => {
  try {
    const url = new URL(req.url);
    const path = url.pathname;

    if (path.endsWith('/sync/pull')) {
      return await handlePull(req); // dukung GET atau POST
    }
    if (path.endsWith('/sync/push')) {
      return await handlePush(req); // khusus POST
    }

    return new Response(JSON.stringify({ error: 'not_found' }), { status: 404 });
  } catch (e) {
    console.error('[sync_main]', e);
    return new Response(
      JSON.stringify({ error: 'sync_main_failed', message: e.message }),
      { status: 500 },
    );
  }
});
