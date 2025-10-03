USE rbac_sync;

CREATE TABLE IF NOT EXISTS users(
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(32) NOT NULL,
  phone VARCHAR(32) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS companies(
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS memberships(
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  company_id CHAR(36) NOT NULL,
  role ENUM('OWNER','CASHIER') NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_member (user_id, company_id),
  INDEX (company_id)
);

CREATE TABLE IF NOT EXISTS sessions(
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id)
);

CREATE TABLE IF NOT EXISTS invite_codes(
  code VARCHAR(16) PRIMARY KEY,
  company_id CHAR(36) NOT NULL,
  role ENUM('CASHIER') NOT NULL DEFAULT 'CASHIER',
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (company_id)
);

CREATE TABLE transactions (
    id          VARCHAR(64) PRIMARY KEY,
    company_id  VARCHAR(64) NOT NULL,
    menu_id     VARCHAR(64) NULL,
    name        VARCHAR(255) NOT NULL,
    type        ENUM('INCOME','EXPENSE') NOT NULL,
    amount      DECIMAL(18,2) NOT NULL,
    quantity    INT NOT NULL DEFAULT 1,
    unit_price  DECIMAL(18,2) NULL,
    occurred_at DATETIME(6) NOT NULL,
    created_at  DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at  DATETIME(6) NOT NULL,
    deleted_at  DATETIME(6) NULL
)

CREATE TABLE IF NOT EXISTS menus (
  id          VARCHAR(64)  NOT NULL,
  company_id  VARCHAR(64)  NOT NULL,
  name        VARCHAR(255) NOT NULL,
  price       DECIMAL(18,2) NOT NULL,
  category    ENUM('food', 'drink') NOT NULL,
  occurred_at DATETIME(6)  NOT NULL,
  created_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at  DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  deleted_at  DATETIME(6)  NULL,

  PRIMARY KEY (id),
  KEY idx_menu_company_updated (company_id, updated_at)
);