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
