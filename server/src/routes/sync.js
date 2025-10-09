import {Router} from 'express';
import {sb} from '../supabase.js';

const router = Router();

function getSessionId(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
}
async function getUserFromSession(req) {
  const sid = getSessionId(req);
  if (!sid) return {error: 'missing_token'};
  const now = new Date().toISOString();

  const {data: session, error: eSess} = await sb
    .from('sessions')
    .select('id, user_id, expires_at')
    .eq('id', sid)
    .gt('expires_at', now)
    .single();
  if (eSess || !session) return {error: 'invalid_or_expired_session'};
  return {session};
}
async function assertMembership(user_id, company_id) {
  const {data: m, error} = await sb
    .from('memberships')
    .select('id')
    .eq('user_id', user_id)
    .eq('company_id', company_id)
    .maybeSingle();
  if (error) throw error;
  if (!m) throw new Error('not_member_of_company');
}

router.get('/pull', async (req, res) => {
  try {
    const {session, error} = await getUserFromSession(req);
    if (error) return res.status(401).json({error});

    const company_id = String(req.query.company_id || '').trim();
    const since =
      String(req.query.since || '').trim() || '1970-01-01T00:00:00Z';
    if (!company_id) return res.status(400).json({error: 'missing_company_id'});

    await assertMembership(session.user_id, company_id);

    const {data: menus, error: e1} = await sb
      .from('menus')
      .select('*')
      .eq('company_id', company_id)
      .gte('updated_at', since)
      .order('updated_at', {ascending: true});
    if (e1) throw e1;

    const {data: txs, error: e2} = await sb
      .from('transactions')
      .select('*')
      .eq('company_id', company_id)
      .gte('updated_at', since)
      .order('updated_at', {ascending: true});
    if (e2) throw e2;

    return res.json({
      ok: true,
      server_time: new Date().toISOString(),
      menus: menus ?? [],
      transactions: txs ?? [],
    });
  } catch (e) {
    if (e?.message === 'not_member_of_company') {
      return res.status(403).json({error: 'not_member_of_company'});
    }
    console.error('[sync/pull]', e);
    return res.status(500).json({error: 'sync_pull_failed'});
  }
});

router.post('/push', async (req, res) => {
  try {
    const {session, error} = await getUserFromSession(req);
    if (error) return res.status(401).json({error});

    const {
      company_id,
      menus_upsert = [],
      menus_delete = [],
      transactions_upsert = [],
      transactions_delete = [],
    } = req.body || {};

    if (!company_id) return res.status(400).json({error: 'missing_company_id'});
    await assertMembership(session.user_id, company_id);

    const nowIso = new Date().toISOString();
    const withCompanyAndUpdatedAt = r => {
      const hasDelete = !!r?.deleted_at;
      return {
        ...r,
        company_id,
        // kalau client lupa isi updated_at saat delete, kita paksa nowIso
        updated_at: r?.updated_at ?? (hasDelete ? nowIso : nowIso),
      };
    };

    if (menus_upsert.length) {
      const payload = menus_upsert.map(withCompanyAndUpdatedAt);
      const {error: eM} = await sb
        .from('menus')
        .upsert(payload, {onConflict: 'id'});
      if (eM) {
        console.error('[sync/push] menus_upsert error:', eM);
        return res.status(500).json({error: 'menus_upsert_failed'});
      }
    }

    if (menus_delete.length) {
      const {error: eMD} = await sb
        .from('menus')
        .update({deleted_at: nowIso, updated_at: nowIso})
        .eq('company_id', company_id)
        .in('id', menus_delete);
      if (eMD) {
        console.error('[sync/push] menus_delete error:', eMD);
        return res.status(500).json({error: 'menus_delete_failed'});
      }
    }

    if (transactions_upsert.length) {
      const payload = transactions_upsert.map(withCompanyAndUpdatedAt);
      const {error: eT} = await sb
        .from('transactions')
        .upsert(payload, {onConflict: 'id'});
      if (eT) {
        console.error('[sync/push] transactions_upsert error:', eT);
        return res.status(500).json({error: 'transactions_upsert_failed'});
      }
    }
    if (transactions_delete.length) {
      const {error: eTD} = await sb
        .from('transactions')
        .update({deleted_at: nowIso, updated_at: nowIso})
        .eq('company_id', company_id)
        .in('id', transactions_delete);
      if (eTD) {
        console.error('[sync/push] transactions_delete error:', eTD);
        return res.status(500).json({error: 'transactions_delete_failed'});
      }
    }

    return res.json({
      ok: true,
      server_time: nowIso,
      stats: {
        menus_upserted: menus_upsert.length,
        menus_deleted: menus_delete.length,
        transactions_upserted: transactions_upsert.length,
        transactions_deleted: transactions_delete.length,
      },
    });
  } catch (e) {
    if (e?.message === 'not_member_of_company') {
      return res.status(403).json({error: 'not_member_of_company'});
    }
    console.error('[sync/push]', e);
    return res.status(500).json({error: 'sync_push_failed'});
  }
});

export default router;
