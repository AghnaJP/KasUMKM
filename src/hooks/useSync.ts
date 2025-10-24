import EncryptedStorage from 'react-native-encrypted-storage';
import { API_BASE } from '../constants/api';
import { useAuth } from '../context/AuthContext';
import { hardDeleteTransactions } from '../database/transactions/transactionUnified';
import { hardDeleteMenus } from '../database/menus/menuUnified';


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

import { mirrorPulledTxToLegacy } from '../database/sync/legacyMirror';

const KEY = (companyId: string) => `last_sync_at:${companyId}`;

export function useSync() {
  const { companyId } = useAuth();

  async function syncNow(): Promise<void> {
    if (!companyId) return;

    // 1) Kumpulkan perubahan lokal
    const dirtyTransactions = await getDirtyTransactions();
    const dirtyMenus = await getDirtyMenus();

    // Klasifikasi payload
    const txUpsert   = dirtyTransactions.filter(t => !t.deleted_at);
    const txDelete   = dirtyTransactions.filter(t =>  t.deleted_at).map(t => t.id);
    const menuUpsert = dirtyMenus.filter(m => !m.deleted_at);
    const menuDelete = dirtyMenus.filter(m =>  m.deleted_at).map(m => m.id);

    // 2) PUSH (hanya kalau ada perubahan)
    if (txUpsert.length || txDelete.length || menuUpsert.length || menuDelete.length) {
      const payload = {
        company_id: companyId,
        menus_upsert: menuUpsert.map(m => ({
          id: m.id,
          name: m.name,
          price: m.price,
          category: m.category,
          occurred_at: m.occurred_at,
          updated_at: m.updated_at,
        })),
        menus_delete: menuDelete,
        transactions_upsert: txUpsert.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          amount: t.amount,
          quantity: (t as any).quantity ?? 1,
          unit_price: (t as any).unit_price ?? null,
          menu_id: (t as any).menu_id ?? null,
          occurred_at: t.occurred_at,
          updated_at: t.updated_at,
        })),
        transactions_delete: txDelete,
      };

      const pr = await fetch(`${API_BASE}/sync/push`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const pushRaw = await pr.text();
      let pushJson: any = {};
      try { pushJson = pushRaw ? JSON.parse(pushRaw) : {}; } catch {}

      if (!pr.ok) {
        throw new Error(pushJson?.error || `push_failed_${pr.status}`);
      }

      const markTime = pushJson?.server_time || new Date().toISOString();

      if (txUpsert.length)  await markTransactionsSynced(txUpsert.map(t => t.id), markTime);
      if (menuUpsert.length) await markMenusSynced(menuUpsert.map(m => m.id), markTime);

      if (txDelete.length) {
        await hardDeleteTransactions(txDelete);
      }
      if (menuDelete.length) {
        await hardDeleteMenus(menuDelete);
      }
    }

    // 3) PULL semenjak last_sync_at
    const since = (await EncryptedStorage.getItem(KEY(companyId))) ?? '1970-01-01T00:00:00Z';

    const gr = await fetch(
      `${API_BASE}/sync/pull?company_id=${encodeURIComponent(companyId)}&since=${encodeURIComponent(since)}`,
      { method: 'GET' }
    );

    const pullRaw = await gr.text();
    let gj: any = {};
    try {
      gj = pullRaw ? JSON.parse(pullRaw) : {};
    } catch {
      throw new Error(`pull_parse_failed: ${pullRaw?.slice(0, 200)}`);
    }
    if (!gr.ok) throw new Error(gj?.error || `pull_failed_${gr.status}`);

    const pulledMenus = Array.isArray(gj?.menus) ? gj.menus : [];
    if (pulledMenus.length) await applyPulledMenus(pulledMenus);

    const pulledTx = Array.isArray(gj?.transactions) ? gj.transactions : [];
    if (pulledTx.length) {
      await applyPulledTransactions(pulledTx);
      await mirrorPulledTxToLegacy(pulledTx);
    }

    // 4) Simpan timestamp server sebagai last_sync_at
    const serverTime = gj?.server_time || new Date().toISOString();
    await EncryptedStorage.setItem(KEY(companyId), String(serverTime));
  }

  return { syncNow };
}
