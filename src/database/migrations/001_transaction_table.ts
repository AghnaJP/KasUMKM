import {getDBConnection} from '../db'; // asumsikan ini di file terpisah

export const migrateCreateTransactionsTable = async () => {
  const db = await getDBConnection(); // ✅ koneksi db dengan await

  await db.transaction(async tx => {
    await tx.executeSql(`
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

    await tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_tx_updated ON transactions(updated_at);
    `);

    await tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_tx_deleted ON transactions(deleted_at);
    `);

    await tx.executeSql(`
      CREATE INDEX IF NOT EXISTS idx_tx_type_date ON transactions(type, occurred_at);
    `);

    await tx.executeSql(`
      CREATE TRIGGER IF NOT EXISTS trg_tx_after_update
      AFTER UPDATE ON transactions
      FOR EACH ROW
      BEGIN
        UPDATE transactions
        SET updated_at = datetime('now'),
            dirty = 1
        WHERE id = OLD.id;
      END;
    `);

    await tx.executeSql(`
      CREATE TRIGGER IF NOT EXISTS trg_tx_soft_delete
      BEFORE UPDATE ON transactions
      FOR EACH ROW
      WHEN NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL
      BEGIN
        UPDATE transactions
        SET updated_at = datetime('now'),
            dirty = 1
        WHERE id = OLD.id;
      END;
    `);
  });

  console.log('✅ Migration completed: transactions table created.');
};
