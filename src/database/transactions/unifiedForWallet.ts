import {ID} from '../../types/menu';
import {executeSql} from '../db';
import {ensureMapTable, mirrorOneUnifiedById} from '../sync/legacyMirror';

export type IncomeData = {
  id: number;
  description: string;
  price: number;
  quantity: number;
  amount: number;
  date: string;
};

export type ExpenseData = IncomeData;

export async function getUnifiedIncomeDetails(): Promise<IncomeData[]> {
  const res = await executeSql(
    `SELECT rowid AS id, name, amount, quantity, unit_price, occurred_at
       FROM transactions
      WHERE deleted_at IS NULL AND type='INCOME'
      ORDER BY occurred_at DESC`,
  );

  const rows: IncomeData[] = [];
  for (let i = 0; i < res.rows.length; i++) {
    const r = res.rows.item(i);
    const qty = Number(r.quantity ?? 1) || 1;
    const unit =
      r.unit_price != null
        ? Number(r.unit_price)
        : qty > 0
        ? Number(r.amount) / qty
        : Number(r.amount);
    rows.push({
      id: Number(r.id),
      description: String(r.name ?? ''),
      price: unit,
      quantity: qty,
      amount: unit * qty,
      date: String(r.occurred_at ?? new Date().toISOString()),
    });
  }
  return rows;
}

export async function getUnifiedExpenseDetails(): Promise<ExpenseData[]> {
  const res = await executeSql(
    `SELECT rowid AS id, name, amount, quantity, unit_price, occurred_at
       FROM transactions
      WHERE deleted_at IS NULL AND type='EXPENSE'
      ORDER BY occurred_at DESC`,
  );

  const rows: ExpenseData[] = [];
  for (let i = 0; i < res.rows.length; i++) {
    const r = res.rows.item(i);
    const qty = Number(r.quantity ?? 1) || 1;
    const unit =
      r.unit_price != null
        ? Number(r.unit_price)
        : qty > 0
        ? Number(r.amount) / qty
        : Number(r.amount);
    rows.push({
      id: Number(r.id),
      description: String(r.name ?? ''),
      price: unit,
      quantity: qty,
      amount: unit * qty,
      date: String(r.occurred_at ?? new Date().toISOString()),
    });
  }
  return rows;
}

export async function updateUnifiedByRowId(
  rowId: number,
  patch: {
    description?: string;
    price?: number;
    quantity?: number;
    date?: string;
  },
) {
  const q = await executeSql(
    `SELECT rowid, id, type, name, amount, occurred_at, menu_id, unit_price, quantity
       FROM transactions
      WHERE rowid = ?`,
    [rowId],
  );
  if (q.rows.length === 0) throw new Error('row_not_found');

  const row = q.rows.item(0) as {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    name: string;
    amount: number;
    occurred_at: string;
    menu_id: string | null;
    unit_price: number | null;
    quantity: number | null;
  };

  const nextName = patch.description ?? row.name;
  const nextQty = Number(patch.quantity ?? row.quantity ?? 1);
  const nextUnit =
    patch.price != null
      ? Number(patch.price)
      : row.unit_price != null
      ? Number(row.unit_price)
      : nextQty > 0
      ? Number(row.amount) / nextQty
      : Number(row.amount);

  const nextAmount = Math.round(nextUnit * nextQty);

  const nextWhen = patch.date
    ? new Date(patch.date).toISOString()
    : row.occurred_at;

  const now = new Date().toISOString();

  await executeSql(
    `UPDATE transactions
        SET name = ?, unit_price = ?, quantity = ?, amount = ?,
            occurred_at = ?, updated_at = ?, dirty = 1
      WHERE id = ?`,
    [nextName, nextUnit, nextQty, nextAmount, nextWhen, now, row.id],
  );

  await mirrorOneUnifiedById(row.id);
}

export async function getUnifiedOneByRowId(rowId: number) {
  const res = await executeSql(
    `SELECT rowid AS id, name, amount, quantity, unit_price, occurred_at
       FROM transactions
      WHERE rowid = ?`,
    [rowId],
  );
  if (res.rows.length === 0) throw new Error('row_not_found');
  const r = res.rows.item(0);
  const qty = Number(r.quantity ?? 1) || 1;
  const unit =
    r.unit_price != null
      ? Number(r.unit_price)
      : qty > 0
      ? Number(r.amount) / qty
      : Number(r.amount);

  return {
    id: Number(r.id),
    description: String(r.name ?? ''),
    price: unit,
    quantity: qty,
    amount: unit * qty,
    date: String(r.occurred_at ?? new Date().toISOString()),
  } as IncomeData;
}

export async function softDeleteUnifiedByRowId(rowId: ID) {
  const rid = Number(rowId);
  if (!Number.isFinite(rid)) {
    throw new Error('invalid_rowid');
  }

  const q = await executeSql(
    `SELECT rowid, id FROM transactions WHERE rowid=? LIMIT 1`,
    [rid],
  );
  if (q.rows.length === 0) {
    throw new Error('row_not_found');
  }
  const remoteId = String(q.rows.item(0).id);
  const now = new Date().toISOString();

  await ensureMapTable();

  await executeSql('BEGIN');
  try {
    await executeSql(
      `UPDATE transactions
         SET deleted_at=?, updated_at=?, dirty=1
       WHERE rowid=?`,
      [now, now, rid],
    );

    const m = await executeSql(
      `SELECT table_name, local_id
         FROM remote_tx_map
        WHERE remote_id=? LIMIT 1`,
      [remoteId],
    );

    if (m.rows.length > 0) {
      const map = m.rows.item(0) as {
        table_name: 'income' | 'expense';
        local_id: number;
      };

      if (map.table_name === 'income') {
        await executeSql(`DELETE FROM incomes WHERE id=?`, [map.local_id]);
      } else {
        await executeSql(`DELETE FROM expenses WHERE id=?`, [map.local_id]);
      }

      // bersihkan mapping
      await executeSql(`DELETE FROM remote_tx_map WHERE remote_id=?`, [
        remoteId,
      ]);
    }

    await executeSql('COMMIT');
  } catch (e) {
    await executeSql('ROLLBACK');
    console.log('[softDeleteUnifiedByRowId] error:', e);
    throw e;
  }
}
