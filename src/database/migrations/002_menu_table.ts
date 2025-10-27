import {executeSql, debugDatabaseList, tableExists} from '../db';

export async function migrateCreateMenuTable() {
  await debugDatabaseList('MIGRATION_MENU');
  await executeSql(`
    CREATE TABLE IF NOT EXISTS menus (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('food', 'drink')),
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      dirty INTEGER NOT NULL DEFAULT 1
    );
  `);

  await executeSql(
    'CREATE INDEX IF NOT EXISTS idx_menu_updated ON menus(updated_at);',
  );
  await executeSql(
    'CREATE INDEX IF NOT EXISTS idx_menu_deleted ON menus(deleted_at);',
  );
  await executeSql(
    'CREATE INDEX IF NOT EXISTS idx_menu_category ON menus(category, occurred_at);',
  );

  const ok = await tableExists('menus');
  console.log(
    'Menu migration completed:',
    ok ? 'menus table created.' : 'WARNING: menus table still not visible',
  );
}
