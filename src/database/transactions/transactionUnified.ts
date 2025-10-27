import {executeSql, rowsToArray} from '../db';
import {newId} from '../../utils/id';

export type TxType = 'INCOME' | 'EXPENSE';

export type TxRow = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  quantity: number;
  unit_price: number | null;
  menu_id: string | null;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  dirty: number;
};

export async function addTransaction(input: {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  amount?: number;
  quantity?: number;
  unit_price?: number;
  menu_id?: string | null;
  occurred_at?: string;
}): Promise<string> {
  const id = newId();
  const now = new Date().toISOString();
  const when = input.occurred_at || now;

  const qty = Number(input.quantity ?? 1);
  const unit = input.unit_price != null ? Number(input.unit_price) : undefined;
  const amount =
    input.amount != null ? Number(input.amount) : unit != null ? unit * qty : 0;

  await executeSql(
    `INSERT INTO transactions
      (id, name, type, amount, quantity, unit_price, menu_id,
       occurred_at, created_at, updated_at, deleted_at, dirty)
     VALUES (?,?,?,?,?,?,?, ?, ?, ?, NULL, 1)`,
    [
      id,
      input.name,
      input.type,
      amount,
      qty,
      unit ?? null,
      input.menu_id ?? null,
      when,
      now,
      now,
    ],
  );
  return id;
}

export async function updateTransaction(
  id: string,
  patch: Partial<Pick<TxRow, 'name' | 'type' | 'amount' | 'occurred_at'>>,
) {
  const now = new Date().toISOString();
  const sets: string[] = [];
  const vals: any[] = [];
  if (patch.name != null) {
    sets.push('name=?');
    vals.push(patch.name);
  }
  if (patch.type != null) {
    sets.push('type=?');
    vals.push(patch.type);
  }
  if (patch.amount != null) {
    sets.push('amount=?');
    vals.push(patch.amount);
  }
  if (patch.occurred_at != null) {
    sets.push('occurred_at=?');
    vals.push(patch.occurred_at);
  }

  sets.push('updated_at=?');
  vals.push(now);
  sets.push('dirty=1');

  await executeSql(`UPDATE transactions SET ${sets.join(', ')} WHERE id=?`, [
    ...vals,
    id,
  ]);
}

export async function softDeleteTransaction(id: string) {
  const now = new Date().toISOString();
  await executeSql(
    `UPDATE transactions
       SET deleted_at = ?, updated_at = ?, dirty = 1
     WHERE id = ?`,
    [now, now, id],
  );
}

export async function hardDeleteTransactions(ids: string[]) {
  if (!ids.length) {return;}
  const ph = ids.map(() => '?').join(',');
  await executeSql(`DELETE FROM transactions WHERE id IN (${ph})`, ids);
}

export async function getTransactionsInMonth(year: number, month0: number) {
  const start = new Date(Date.UTC(year, month0, 1, 0, 0, 0)).toISOString();
  const end = new Date(Date.UTC(year, month0 + 1, 1, 0, 0, 0)).toISOString();
  const rs = await executeSql(
    `SELECT id, name, type, amount, occurred_at, created_at, updated_at, deleted_at, dirty
       FROM transactions
      WHERE deleted_at IS NULL AND occurred_at >= ? AND occurred_at < ?
      ORDER BY occurred_at DESC`,
    [start, end],
  );
  return rowsToArray(rs) as TxRow[];
}

export async function getDirtyTransactions(): Promise<TxRow[]> {
  const rs = await executeSql(
    `SELECT id, name, type, amount, quantity, unit_price, menu_id,
            occurred_at, created_at, updated_at, deleted_at, dirty
       FROM transactions
      WHERE dirty=1`,
  );
  return rowsToArray(rs) as TxRow[];
}

export async function markTransactionsSynced(
  ids: string[],
  serverTimeISO: string,
) {
  if (!ids.length) {return;}
  const placeholders = ids.map(() => '?').join(',');
  await executeSql(
    `UPDATE transactions SET dirty=0, updated_at=? WHERE id IN (${placeholders})`,
    [serverTimeISO, ...ids],
  );
}

export async function applyPulledTransactions(rows: Array<{
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  quantity?: number;
  unit_price?: number | null;
  menu_id?: string | null;
  occurred_at: string;
  updated_at: string;
  deleted_at?: string | null;
}>) {
  await executeSql('BEGIN');
  try {
    for (const r of rows) {
      if (r.deleted_at) {
        await executeSql('DELETE FROM transactions WHERE id=?', [r.id]);
        continue;
      }
      await executeSql(
        `INSERT INTO transactions
           (id, name, type, amount, quantity, unit_price, menu_id,
            occurred_at, created_at, updated_at, deleted_at, dirty)
         VALUES (?,?,?,?,?,?,?, ?, datetime('now'), ?, NULL, 0)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           type=excluded.type,
           amount=excluded.amount,
           quantity=excluded.quantity,
           unit_price=excluded.unit_price,
           menu_id=excluded.menu_id,
           occurred_at=excluded.occurred_at,
           updated_at=excluded.updated_at,
           deleted_at=NULL,
           dirty=0`,
        [
          r.id,
          r.name,
          r.type,
          r.amount,
          Number(r.quantity ?? 1),
          r.unit_price ?? null,
          r.menu_id ?? null,
          r.occurred_at,
          r.updated_at,
        ],
      );
    }
    await executeSql('COMMIT');
  } catch (e) {
    await executeSql('ROLLBACK');
    throw e;
  }
}
