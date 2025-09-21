// src/hooks/useSync.ts
import EncryptedStorage from 'react-native-encrypted-storage';
import {API_BASE} from '../constants/api';
import {useAuth} from '../context/AuthContext';
import {
  getDirtyTransactions,
  markTransactionsSynced,
  applyPulledTransactions,
} from '../database/transactions/transactionUnified'; // <-- perbaiki path!

const KEY = (companyId: string) => `last_sync_at:${companyId}`;

export function useSync() {
  const {companyId, getAuthHeaders} = useAuth();

  async function syncNow(): Promise<void> {
    if (!companyId) return;

    const headers = await getAuthHeaders();

    // === PUSH ===
    const dirtyRaw = await getDirtyTransactions();
    const dirty = Array.isArray(dirtyRaw) ? dirtyRaw : []; // <-- guard
    if (dirty.length > 0) {
      const body = JSON.stringify({
        company_id: companyId,
        changes: {
          transactions: dirty.map(d => ({
            id: d.id,
            name: d.name,
            type: d.type,
            amount: d.amount,
            occurred_at: d.occurred_at,
            updated_at: d.updated_at,
            deleted_at: d.deleted_at ?? null,
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
      await markTransactionsSynced(
        dirty.map(d => d.id),
        nowISO,
      );
    }

    // === PULL ===
    const url = `${API_BASE}/sync/pull?company_id=${companyId}`;
    console.log('PULL URL =', url);
    console.log('HEADERS =', headers);

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

    const pulled = Array.isArray(gj?.transactions) ? gj.transactions : [];
    await applyPulledTransactions(pulled);

    if (gj?.server_time) {
      await EncryptedStorage.setItem(KEY(companyId), String(gj.server_time));
    }
  }

  return {syncNow};
}
