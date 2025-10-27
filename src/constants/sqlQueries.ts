export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`;

export const CREATE_MENUS_TABLE = `
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
`;

export const CREATE_INCOME_TABLE = `
  CREATE TABLE IF NOT EXISTS incomes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      menu_id TEXT NULL,
      quantity INTEGER NOT NULL,
      custom_description TEXT,
      custom_price INTEGER,
      custom_quantity INTEGER,
      custom_created_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE SET NULL
  );
`;

export const CREATE_EXPENSE_TABLE = `
  CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      custom_description TEXT,
      custom_price INTEGER,
      custom_quantity INTEGER,
      custom_created_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
  );
`;
