import EncryptedStorage from 'react-native-encrypted-storage';
import {API_BASE} from '../constants/api';
import {useAuth} from '../context/AuthContext';

import {
  getDirtyTransactions,
  markTransactionsSynced,
  applyPulledTransactions,
} from '../database/transactions/transactionUnified';

import {
  getDirtyMenus,
  markMenusSynced,
  applyPulledMenus,
} from '../database/menus/menuUnified';

import {mirrorPulledTxToLegacy} from '../database/sync/legacyMirror';

const KEY = (companyId: string) => `last_sync_at:${companyId}`;

export function useSync() {
  const {companyId, getAuthHeaders} = useAuth();

  async function syncNow(): Promise<void> {
    if (!companyId) return;

    const authHeaders = await getAuthHeaders();

    const dirtyTransactions = await getDirtyTransactions();
    const dirtyMenus = await getDirtyMenus();

    if (dirtyTransactions.length > 0 || dirtyMenus.length > 0) {
      const payload = {
        company_id: companyId,
        menus_upsert: dirtyMenus.map(m => ({
          id: m.id,
          name: m.name,
          price: m.price,
          category: m.category,
          occurred_at: m.occurred_at,
          updated_at: m.updated_at,
          deleted_at: m.deleted_at ?? null,
        })),
        menus_delete: [],
        transactions_upsert: dirtyTransactions.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          amount: t.amount,
          quantity: (t as any).quantity ?? 1,
          unit_price: (t as any).unit_price ?? null,
          menu_id: (t as any).menu_id ?? null,
          occurred_at: t.occurred_at,
          updated_at: t.updated_at,
          deleted_at: t.deleted_at ?? null,
        })),
        transactions_delete: [],
      };

      const pr = await fetch(`${API_BASE}/sync/push`, {
        method: 'POST',
        headers: {
          ...authHeaders,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const pushRaw = await pr.text();
      let pushJson: any = {};
      try {
        pushJson = pushRaw ? JSON.parse(pushRaw) : {};
      } catch {
        // ignore; akan dilemparkan sebagai error di bawah kalau !pr.ok
      }
      if (!pr.ok) {
        throw new Error(pushJson?.error || `push_failed_${pr.status}`);
      }

      const serverTimeFromPush: string | undefined = pushJson?.server_time;
      const markTime = serverTimeFromPush || new Date().toISOString();

      if (dirtyTransactions.length) {
        await markTransactionsSynced(
          dirtyTransactions.map(t => t.id),
          markTime,
        );
      }
      if (dirtyMenus.length) {
        await markMenusSynced(
          dirtyMenus.map(m => m.id),
          markTime,
        );
      }
    }

    const since =
      (await EncryptedStorage.getItem(KEY(companyId))) ??
      '1970-01-01T00:00:00Z';

    const pullUrl = `${API_BASE}/sync/pull?company_id=${encodeURIComponent(
      companyId,
    )}&since=${encodeURIComponent(since)}`;

    const gr = await fetch(pullUrl, {headers: authHeaders});

    const pullRaw = await gr.text();
    let gj: any = {};
    try {
      gj = pullRaw ? JSON.parse(pullRaw) : {};
    } catch {
      // jika bukan JSON, lempar error dengan body mentahnya
      throw new Error(`pull_parse_failed: ${pullRaw?.slice(0, 200)}`);
    }
    if (!gr.ok) {
      throw new Error(gj?.error || `pull_failed_${gr.status}`);
    }

    const pulledMenus = Array.isArray(gj?.menus) ? gj.menus : [];
    if (pulledMenus.length > 0) {
      await applyPulledMenus(pulledMenus);
    }

    const pulledTransactions = Array.isArray(gj?.transactions)
      ? gj.transactions
      : [];
    if (pulledTransactions.length > 0) {
      await applyPulledTransactions(pulledTransactions);
      await mirrorPulledTxToLegacy(pulledTransactions);
    }

    const serverTime = gj?.server_time || new Date().toISOString();
    await EncryptedStorage.setItem(KEY(companyId), String(serverTime));
  }

  return {syncNow};
}
