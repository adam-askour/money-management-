CREATE DATABASE IF NOT EXISTS adam_money CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE adam_money;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(255) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_name CHECK (CHAR_LENGTH(name) BETWEEN 1 AND 80)
) ENGINE=InnoDB;

CREATE TABLE budgets (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  daily_budget_centimes INT UNSIGNED NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_budget_positive CHECK (daily_budget_centimes BETWEEN 1 AND 10000000),
  CONSTRAINT chk_budget_dates CHECK (effective_to IS NULL OR effective_to >= effective_from),
  UNIQUE KEY uq_budget_start (user_id,effective_from),
  KEY idx_budget_lookup (user_id,effective_from,effective_to)
) ENGINE=InnoDB;

CREATE TABLE expenses (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  expense_date DATE NOT NULL,
  description VARCHAR(120) NOT NULL,
  amount_centimes INT UNSIGNED NOT NULL,
  idempotency_key VARCHAR(80) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_expense_amount CHECK (amount_centimes BETWEEN 1 AND 10000000),
  CONSTRAINT chk_expense_description CHECK (CHAR_LENGTH(description) BETWEEN 1 AND 120),
  UNIQUE KEY uq_expense_idempotency (user_id,idempotency_key),
  KEY idx_expense_month (user_id,expense_date),
  KEY idx_expense_owner (id,user_id)
) ENGINE=InnoDB;

INSERT INTO users(name,email,password_hash) VALUES ('Adam','adam@local.invalid',NULL);
INSERT INTO budgets(user_id,daily_budget_centimes,effective_from,effective_to) VALUES (1,4000,'2026-08-01',NULL);
