// src/database/migrations/001_transaction_table.ts
import {executeSql, debugDatabaseList, tableExists} from '../db';

export async function migrateCreateTransactionsTable() {
  await debugDatabaseList('MIGRATION');

  await executeSql(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('INCOME','EXPENSE')),
      amount INTEGER NOT NULL,
      occurred_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT,
      dirty INTEGER NOT NULL DEFAULT 1
    );
  `);
  await executeSql(
    `CREATE INDEX IF NOT EXISTS idx_tx_updated ON transactions(updated_at);`,
  );
  await executeSql(
    `CREATE INDEX IF NOT EXISTS idx_tx_deleted ON transactions(deleted_at);`,
  );
  await executeSql(
    `CREATE INDEX IF NOT EXISTS idx_tx_type_date ON transactions(type, occurred_at);`,
  );

  const ok = await tableExists('transactions');
  console.log(
    '✅ Migration completed:',
    ok ? 'transactions table created.' : 'WARNING: table still not visible',
  );
}
