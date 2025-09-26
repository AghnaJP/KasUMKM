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

const KEY = (companyId: string) => `last_sync_at:${companyId}`;

export function useSync() {
  const {companyId, getAuthHeaders} = useAuth();

  async function syncNow(): Promise<void> {
    if (!companyId) return;

    const headers = await getAuthHeaders();

    // === PUSH TRANSACTIONS ===
    const dirtyTransactions = await getDirtyTransactions();
    console.log('Mulai sinkronisasi...');
    console.log('SYNC dirty transactions count =', dirtyTransactions.length);
    console.log('Mulai sinkronisasi...');

    // === PUSH MENUS ===
    const dirtyMenus = await getDirtyMenus();
    console.log('Mulai sinkronisasi...');
    console.log('SYNC dirty menus count =', dirtyMenus.length);
    console.log('Mulai sinkronisasi...');

    // Combine both transactions and menus in one request
    if (dirtyTransactions.length > 0 || dirtyMenus.length > 0) {
      const body = JSON.stringify({
        company_id: companyId,
        changes: {
          transactions: dirtyTransactions.map(t => ({
            id: t.id,
            name: t.name,
            type: t.type,
            amount: t.amount,
            occurred_at: t.occurred_at,
            updated_at: t.updated_at,
            deleted_at: t.deleted_at ?? null,
          })),
          menus: dirtyMenus.map(m => ({
            id: m.id,
            name: m.name,
            price: m.price,
            category: m.category,
            occurred_at: m.occurred_at,
            updated_at: m.updated_at,
            deleted_at: m.deleted_at ?? null,
          })),
        },
      });

      const pr = await fetch(`${API_BASE}/sync/push`, {
        method: 'POST',
        headers,
        body,
      });

      let pj: any = {};
      try {
        pj = await pr.json();
      } catch {}
      if (!pr.ok) throw new Error(pj?.error || 'push_failed');

      const nowISO = new Date().toISOString();

      // Mark transactions as synced
      if (dirtyTransactions.length > 0) {
        await markTransactionsSynced(
          dirtyTransactions.map(t => t.id),
          nowISO,
        );
      }

      // Mark menus as synced
      if (dirtyMenus.length > 0) {
        await markMenusSynced(
          dirtyMenus.map(m => m.id),
          nowISO,
        );
      }
    }

    // === PULL ===
    const url = `${API_BASE}/sync/pull?company_id=${companyId}`;
    console.log('PULL URL =', url);

    const gr = await fetch(url, {headers});

    // Coba parse JSON; kalau gagal, baca text-nya biar tau 404/HTML error dll
    let gj: any = null;
    let rawText = '';
    try {
      gj = await gr.json();
    } catch {
      try {
        rawText = await gr.text();
      } catch {}
    }

    if (!gr.ok) {
      console.log(
        'PULL FAILED status=',
        gr.status,
        'json=',
        gj,
        'raw=',
        rawText,
      );
      throw new Error(gj?.error || `pull_failed_${gr.status}`);
    }

    // Apply pulled transactions
    const pulledTransactions = Array.isArray(gj?.transactions)
      ? gj.transactions
      : [];
    await applyPulledTransactions(pulledTransactions);

    // Apply pulled menus
    const pulledMenus = Array.isArray(gj?.menus) ? gj.menus : [];
    await applyPulledMenus(pulledMenus);

    if (gj?.server_time) {
      await EncryptedStorage.setItem(KEY(companyId), String(gj.server_time));
    }
  }

  return {syncNow};
}
