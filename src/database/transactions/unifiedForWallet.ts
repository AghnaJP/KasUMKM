import {executeSql} from '../db';

export type IncomeData = {
  id: number;
  description: string;
  price: number;
  quantity: number;
  date: string;
};

export type ExpenseData = IncomeData;

export async function getUnifiedIncomeDetails(): Promise<IncomeData[]> {
  const res = await executeSql(
    `SELECT rowid AS id, name, amount, occurred_at
       FROM transactions
      WHERE deleted_at IS NULL AND type='INCOME'
      ORDER BY occurred_at DESC`,
  );
  const rows: IncomeData[] = [];
  for (let i = 0; i < res.rows.length; i++) {
    const r = res.rows.item(i);
    rows.push({
      id: r.id,
      description: String(r.name ?? ''),
      price: Number(r.amount ?? 0),
      quantity: 1,
      date: String(r.occurred_at ?? new Date().toISOString()),
    });
  }
  return rows;
}

// Ambil EXPENSE
export async function getUnifiedExpenseDetails(): Promise<ExpenseData[]> {
  const res = await executeSql(
    `SELECT rowid AS id, name, amount, occurred_at
       FROM transactions
      WHERE deleted_at IS NULL AND type='EXPENSE'
      ORDER BY occurred_at DESC`,
  );
  const rows: ExpenseData[] = [];
  for (let i = 0; i < res.rows.length; i++) {
    const r = res.rows.item(i);
    rows.push({
      id: r.id,
      description: String(r.name ?? ''),
      price: Number(r.amount ?? 0),
      quantity: 1,
      date: String(r.occurred_at ?? new Date().toISOString()),
    });
  }
  return rows;
}

export async function softDeleteUnifiedByRowId(rowId: number) {
  const q = await executeSql(
    `SELECT id FROM transactions WHERE rowid = ? LIMIT 1`,
    [rowId],
  );
  if (q.rows.length === 0) return;

  const uuid = q.rows.item(0).id as string;
  const now = new Date().toISOString();
  await executeSql(
    `UPDATE transactions SET deleted_at=?, updated_at=?, dirty=1 WHERE id=?`,
    [now, now, uuid],
  );
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
    `SELECT id, type, name, amount, occurred_at
       FROM transactions
      WHERE rowid = ?`,
    [rowId],
  );
  if (q.rows.length === 0) {
    throw new Error('row_not_found');
  }
  const row = q.rows.item(0) as {
    id: string;
    type: 'INCOME' | 'EXPENSE';
    name: string;
    amount: number;
    occurred_at: string;
  };

  const nextName = patch.description ?? row.name;
  const qty = patch.quantity ?? 1;
  const unit = patch.price ?? row.amount;
  const nextAmount = Math.round(Number(unit) * Number(qty));
  const nextWhen = patch.date ?? row.occurred_at;
  const now = new Date().toISOString();

  await executeSql(
    `UPDATE transactions
        SET name = ?,
            amount = ?,
            occurred_at = ?,
            updated_at = ?,
            dirty = 1
      WHERE id = ?`,
    [nextName, nextAmount, nextWhen, now, row.id],
  );
}
