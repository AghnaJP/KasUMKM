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

    const headers = await getAuthHeaders();

    const dirtyTransactions = await getDirtyTransactions();
    const dirtyMenus = await getDirtyMenus();

    if (dirtyTransactions.length > 0 || dirtyMenus.length > 0) {
      const body = JSON.stringify({
        company_id: companyId,
        changes: {
          transactions: dirtyTransactions.map(t => ({
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
      } catch {
        /* ignore */
      }
      if (!pr.ok) {
        throw new Error(pj?.error || 'push_failed');
      }

      const nowISO = new Date().toISOString();
      if (dirtyTransactions.length) {
        await markTransactionsSynced(
          dirtyTransactions.map(t => t.id),
          nowISO,
        );
      }
      if (dirtyMenus.length) {
        await markMenusSynced(
          dirtyMenus.map(m => m.id),
          nowISO,
        );
      }
    }

    const pullUrl = `${API_BASE}/sync/pull?company_id=${companyId}`;
    const gr = await fetch(pullUrl, {headers});

    let gj: any = null;
    let raw = '';
    try {
      gj = await gr.json();
    } catch {
      try {
        raw = await gr.text();
      } catch {
        /* ignore */
      }
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
    }

    if (pulledTransactions.length > 0) {
      await mirrorPulledTxToLegacy(pulledTransactions);
    }

    if (gj?.server_time && companyId) {
      await EncryptedStorage.setItem(KEY(companyId), String(gj.server_time));
    }
  }

  return {syncNow};
}
