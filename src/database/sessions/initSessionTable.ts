import {executeSql} from '../db';

export async function initSessionTable() {
  await executeSql(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY NOT NULL,        -- pakai user_id
      user_id TEXT NOT NULL,
      device_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      expires_at INTEGER,
      is_logged_in INTEGER NOT NULL DEFAULT 1,
      last_sync_at INTEGER,
      sync_cursor TEXT
    );
  `);
  await executeSql(`CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);`);
}
