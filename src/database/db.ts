// src/database/db.ts
import SQLite, {SQLiteDatabase} from 'react-native-sqlite-storage';

SQLite.enablePromise(true);
// SQLite.DEBUG = true; // nyalakan kalau perlu lihat log driver

let dbPromise: Promise<SQLiteDatabase> | null = null;

export async function getDBConnection(): Promise<SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabase({
      name: 'KasUMKM.db',
      location: 'default',
    }).then(async db => {
      await db.executeSql('PRAGMA foreign_keys = ON;');
      return db;
    });
  }
  return dbPromise;
}

export type RS = {
  insertId?: number;
  rowsAffected: number;
  rows: {
    length: number;
    item: (i: number) => any;
    _array?: any[]; // optional; jangan andalkan ini
  };
};

export async function executeSql(sql: string, params: any[] = []): Promise<RS> {
  const db = await getDBConnection();
  const [result] = await db.executeSql(sql, params);
  return result as RS;
}

// ✅ util aman untuk konversi rows → array
export function rowsToArray(rs: RS): any[] {
  const out: any[] = [];
  const len = rs?.rows?.length ?? 0;
  for (let i = 0; i < len; i++) out.push(rs.rows.item(i));
  return out;
}

// Debug helpers (pakai rowsToArray, bukan _array)
export async function debugDatabaseList(tag = 'DB') {
  try {
    const rs = await executeSql('PRAGMA database_list;');
    const arr = rowsToArray(rs);
    console.log(`[${tag}] PRAGMA database_list:`, arr);
    return arr;
  } catch (e) {
    console.log(`[${tag}] PRAGMA database_list error`, e);
    return [];
  }
}

export async function tableExists(name: string): Promise<boolean> {
  const rs = await executeSql(
    "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
    [name],
  );
  const arr = rowsToArray(rs);
  return arr.length > 0;
}
