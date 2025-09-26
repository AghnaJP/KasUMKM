// src/database/menus/menuUnified.ts
import {executeSql, rowsToArray} from '../db';
import {newId} from '../../utils/id';

export type MenuCategory = 'food' | 'drink';

export type MenuRow = {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  occurred_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  dirty: number;
};

export async function addMenu(input: {
  name: string;
  price: number;
  category: MenuCategory;
  occurred_at?: string;
}): Promise<string> {
  const id = newId();
  const now = new Date().toISOString();
  const when = input.occurred_at || now;
  await executeSql(
    `INSERT INTO menus (id, name, price, category, occurred_at, created_at, updated_at, deleted_at, dirty)
     VALUES (?,?,?,?,?,?,?,NULL,1)`,
    [id, input.name, input.price, input.category, when, now, now],
  );
  return id;
}

export async function updateMenu(
  id: string,
  patch: Partial<Pick<MenuRow, 'name' | 'price' | 'category' | 'occurred_at'>>,
) {
  const now = new Date().toISOString();
  const sets: string[] = [];
  const vals: any[] = [];

  if (patch.name != null) {
    sets.push('name=?');
    vals.push(patch.name);
  }
  if (patch.price != null) {
    sets.push('price=?');
    vals.push(patch.price);
  }
  if (patch.category != null) {
    sets.push('category=?');
    vals.push(patch.category);
  }
  if (patch.occurred_at != null) {
    sets.push('occurred_at=?');
    vals.push(patch.occurred_at);
  }

  // tandai kotor + update timestamp
  sets.push('updated_at=?');
  vals.push(now);
  sets.push('dirty=1');

  await executeSql(`UPDATE menus SET ${sets.join(', ')} WHERE id=?`, [
    ...vals,
    id,
  ]);
}

export async function softDeleteMenu(id: string) {
  const now = new Date().toISOString();
  await executeSql(
    `UPDATE menus SET deleted_at=?, updated_at=?, dirty=1 WHERE id=?`,
    [now, now, id],
  );
}

export async function getAllMenus(includeDeleted: boolean = false) {
  const whereClause = includeDeleted ? '' : 'WHERE deleted_at IS NULL';
  const rs = await executeSql(
    `SELECT id, name, price, category, occurred_at, created_at, updated_at, deleted_at, dirty
       FROM menus
       ${whereClause}
       ORDER BY name ASC`,
  );
  return rowsToArray(rs) as MenuRow[];
}

export async function getMenusByCategory(category: MenuCategory) {
  const rs = await executeSql(
    `SELECT id, name, price, category, occurred_at, created_at, updated_at, deleted_at, dirty
       FROM menus
       WHERE category = ? AND deleted_at IS NULL
       ORDER BY name ASC`,
    [category],
  );
  return rowsToArray(rs) as MenuRow[];
}

export async function getDirtyMenus(): Promise<MenuRow[]> {
  const rs = await executeSql(
    `SELECT id, name, price, category, occurred_at, created_at, updated_at, deleted_at, dirty
       FROM menus WHERE dirty=1`,
  );
  return rowsToArray(rs) as MenuRow[];
}

export async function markMenusSynced(ids: string[], serverTimeISO: string) {
  if (!ids.length) return;
  const placeholders = ids.map(() => '?').join(',');
  await executeSql(
    `UPDATE menus SET dirty=0, updated_at=? WHERE id IN (${placeholders})`,
    [serverTimeISO, ...ids],
  );
}

export async function applyPulledMenus(
  rows: Array<{
    id: string;
    name: string;
    price: number;
    category: MenuCategory;
    occurred_at: string;
    updated_at: string;
    deleted_at?: string | null;
  }>,
) {
  await executeSql('BEGIN');
  try {
    for (const r of rows) {
      await executeSql(
        `INSERT INTO menus (id, name, price, category, occurred_at, created_at, updated_at, deleted_at, dirty)
         VALUES (?,?,?,?,?, datetime('now'), ?, ?, 0)
         ON CONFLICT(id) DO UPDATE SET
           name=excluded.name,
           price=excluded.price,
           category=excluded.category,
           occurred_at=excluded.occurred_at,
           updated_at=excluded.updated_at,
           deleted_at=excluded.deleted_at,
           dirty=0`,
        [
          r.id,
          r.name,
          r.price,
          r.category,
          r.occurred_at,
          r.updated_at,
          r.deleted_at ?? null,
        ],
      );
    }
    await executeSql('COMMIT');
  } catch (e) {
    await executeSql('ROLLBACK');
    throw e;
  }
}

export async function getMenuById(id: string): Promise<MenuRow | null> {
  const rs = await executeSql(
    `SELECT id, name, price, category, occurred_at, created_at, updated_at, deleted_at, dirty
       FROM menus
       WHERE id = ?`,
    [id],
  );
  const items = rowsToArray(rs) as MenuRow[];
  return items.length > 0 ? items[0] : null;
}
