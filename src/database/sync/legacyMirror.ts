import {executeSql} from '../db';

export type RemoteTx = {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
  quantity?: number;
  unit_price?: number | null;
  menu_id?: string | null;
  occurred_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export async function ensureMapTable() {
  await executeSql(`
    CREATE TABLE IF NOT EXISTS remote_tx_map (
      remote_id  TEXT PRIMARY KEY,
      table_name TEXT NOT NULL CHECK(table_name IN ('income','expense')),
      local_id   INTEGER NOT NULL
    );
  `);
}

async function getMap(
  remoteId: string,
): Promise<{table_name: 'income' | 'expense'; local_id: number} | null> {
  const rs = await executeSql(
    'SELECT table_name, local_id FROM remote_tx_map WHERE remote_id=? LIMIT 1',
    [remoteId],
  );
  if (rs.rows.length === 0) {return null;}
  const r = rs.rows.item(0);
  return {table_name: r.table_name, local_id: Number(r.local_id)};
}

async function upsertMap(
  remoteId: string,
  tableName: 'income' | 'expense',
  localId: number,
) {
  await executeSql(
    `INSERT INTO remote_tx_map (remote_id, table_name, local_id)
     VALUES (?,?,?)
     ON CONFLICT(remote_id) DO UPDATE SET
       table_name=excluded.table_name,
       local_id=excluded.local_id`,
    [remoteId, tableName, localId],
  );
}

function computeUnit(
  amount: number,
  qty: number,
  unitFromServer?: number | null,
) {
  if (unitFromServer != null) {return Number(unitFromServer);}
  const q = Number(qty || 1);
  return q > 0 ? Number(amount) / q : Number(amount);
}

function toNumOrNull(v: any) {
  return v == null ? null : Number(v);
}

async function upsertIncome(r: RemoteTx) {
  const existing = await getMap(r.id);

  if (r.deleted_at) {
    if (existing?.table_name === 'income') {
      await executeSql('DELETE FROM incomes WHERE id=?', [existing.local_id]);
    }
    return;
  }

  const occurredAt = r.occurred_at;
  const updatedAt = r.updated_at;
  const qtyFromSrv = toNumOrNull(r.quantity);
  const unit = computeUnit(r.amount, Number(r.quantity ?? 1), r.unit_price);

  let menuId: string | null = r.menu_id ?? null;
  if (menuId) {
    const chk = await executeSql('SELECT id FROM menus WHERE id=? LIMIT 1', [
      menuId,
    ]);
    if (chk.rows.length === 0) {menuId = null;}
  }

  if (menuId) {
    if (existing?.table_name === 'income') {
      const sets: string[] = [
        'menu_id=?',
        'custom_description=NULL',
        'custom_price=NULL',
        'custom_quantity=NULL',
        'custom_created_at=NULL',
        'updated_at=?',
      ];
      const vals: any[] = [menuId, updatedAt];

      if (qtyFromSrv != null) {
        sets.splice(1, 0, 'quantity=?');
        vals.splice(1, 0, qtyFromSrv);
      }

      await executeSql(`UPDATE incomes SET ${sets.join(', ')} WHERE id=?`, [
        ...vals,
        existing.local_id,
      ]);
      return;
    }

    const qtyForInsert = qtyFromSrv ?? 1;
    const ins = await executeSql(
      `INSERT INTO incomes (menu_id, quantity, created_at, updated_at)
       VALUES (?,?,?,?)`,
      [menuId, qtyForInsert, occurredAt, updatedAt],
    );
    await upsertMap(r.id, 'income', Number(ins.insertId));
    return;
  }

  if (existing?.table_name === 'income') {
    const sets: string[] = [
      'menu_id=NULL',
      'quantity=1',
      'custom_description=?',
      'custom_price=?',
      'custom_created_at=?',
      'updated_at=?',
    ];
    const vals: any[] = [r.name, unit, occurredAt, updatedAt];

    if (qtyFromSrv != null) {
      sets.splice(3, 0, 'custom_quantity=?');
      vals.splice(3, 0, qtyFromSrv);
    }

    await executeSql(`UPDATE incomes SET ${sets.join(', ')} WHERE id=?`, [
      ...vals,
      existing.local_id,
    ]);
    return;
  }

  const qtyForInsert = qtyFromSrv ?? 1;
  const ins = await executeSql(
    `INSERT INTO incomes (
       menu_id, quantity,
       custom_description, custom_price, custom_quantity, custom_created_at,
       created_at, updated_at
     ) VALUES (NULL, 1, ?, ?, ?, ?, ?, ?)`,
    [r.name, unit, qtyForInsert, occurredAt, occurredAt, updatedAt],
  );
  await upsertMap(r.id, 'income', Number(ins.insertId));
}

async function upsertExpense(r: RemoteTx) {
  const existing = await getMap(r.id);

  if (r.deleted_at) {
    if (existing?.table_name === 'expense') {
      await executeSql('DELETE FROM expenses WHERE id=?', [existing.local_id]);
    }
    return;
  }

  const occurredAt = r.occurred_at;
  const updatedAt = r.updated_at;
  const qtyFromSrv = toNumOrNull(r.quantity);
  const unit = computeUnit(r.amount, Number(r.quantity ?? 1), r.unit_price);

  if (existing?.table_name === 'expense') {
    const sets: string[] = [
      'description=?',
      'price=?',
      'custom_description=?',
      'custom_price=?',
      'custom_created_at=?',
      'updated_at=?',
    ];
    const vals: any[] = [r.name, unit, r.name, unit, occurredAt, updatedAt];

    if (qtyFromSrv != null) {
      sets.splice(2, 0, 'quantity=?');
      sets.splice(5, 0, 'custom_quantity=?');
      vals.splice(2, 0, qtyFromSrv);
      vals.splice(5, 0, qtyFromSrv);
    }

    await executeSql(`UPDATE expenses SET ${sets.join(', ')} WHERE id=?`, [
      ...vals,
      existing.local_id,
    ]);
    return;
  }

  const qtyForInsert = qtyFromSrv ?? 1;
  const ins = await executeSql(
    `INSERT INTO expenses (
       description, price, quantity,
       custom_description, custom_price, custom_quantity, custom_created_at,
       created_at, updated_at
     ) VALUES (?,?,?,?,?,?,?,?,?)`,
    [
      r.name,
      unit,
      qtyForInsert,
      r.name,
      unit,
      qtyForInsert,
      occurredAt,
      occurredAt,
      updatedAt,
    ],
  );
  await upsertMap(r.id, 'expense', Number(ins.insertId));
}

export async function mirrorPulledTxToLegacy(rows: RemoteTx[]) {
  await ensureMapTable();
  await executeSql('BEGIN');
  try {
    for (const r of rows) {
      if (r.type === 'INCOME') {await upsertIncome(r);}
      else {await upsertExpense(r);}
    }
    await executeSql('COMMIT');
  } catch (e) {
    await executeSql('ROLLBACK');
    throw e;
  }
}

export async function linkLocalExpenseToRemote(
  remoteId: string,
  localId: number,
) {
  await ensureMapTable();
  await executeSql(
    `INSERT INTO remote_tx_map (remote_id, table_name, local_id)
     VALUES (?,?,?)
     ON CONFLICT(remote_id) DO UPDATE SET
       table_name=excluded.table_name,
       local_id=excluded.local_id`,
    [remoteId, 'expense', localId],
  );
}

export async function linkLocalIncomeToRemote(
  remoteId: string,
  localId: number,
) {
  await ensureMapTable();
  await executeSql(
    `INSERT INTO remote_tx_map (remote_id, table_name, local_id)
     VALUES (?,?,?)
     ON CONFLICT(remote_id) DO UPDATE SET
       table_name=excluded.table_name,
       local_id=excluded.local_id`,
    [remoteId, 'income', localId],
  );
}

export async function mirrorOneUnifiedById(remoteId: string) {
  await ensureMapTable();
  const rs = await executeSql(
    `SELECT id, name, type, amount, quantity, unit_price, menu_id,
            occurred_at, updated_at, deleted_at
       FROM transactions
      WHERE id = ? LIMIT 1`,
    [remoteId],
  );
  if (rs.rows.length === 0) {return;}

  const r = rs.rows.item(0) as RemoteTx;

  if (r.type === 'INCOME') {await upsertIncome(r);}
  else {await upsertExpense(r);}
}
