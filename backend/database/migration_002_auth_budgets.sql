USE adam_money;

ALTER TABLE users
  ADD COLUMN role ENUM('admin','member') NOT NULL DEFAULT 'member' AFTER password_hash,
  ADD COLUMN last_login_at TIMESTAMP NULL AFTER is_active;

UPDATE users SET role='admin' WHERE id=1;

ALTER TABLE budgets
  ADD COLUMN monthly_budget_centimes INT UNSIGNED NULL AFTER daily_budget_centimes,
  ADD CONSTRAINT chk_monthly_budget_positive CHECK (monthly_budget_centimes IS NULL OR monthly_budget_centimes BETWEEN 1 AND 100000000);

CREATE TABLE invitations (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(254) NOT NULL,
  name VARCHAR(80) NOT NULL,
  token_hash CHAR(64) NOT NULL,
  role ENUM('admin','member') NOT NULL DEFAULT 'member',
  invited_by BIGINT UNSIGNED NULL,
  expires_at TIMESTAMP NOT NULL,
  accepted_at TIMESTAMP NULL,
  revoked_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_invitation_token (token_hash),
  KEY idx_invitation_email (email),
  CONSTRAINT fk_invitation_admin FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
CREATE TABLE rate_limits (
  bucket_key CHAR(64) PRIMARY KEY,
  window_started_at INT UNSIGNED NOT NULL,
  request_count INT UNSIGNED NOT NULL,
  blocked_until INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_rate_limit_cleanup (updated_at)
) ENGINE=InnoDB;

CREATE TABLE security_events (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  event_type VARCHAR(40) NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  metadata_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_security_user (user_id,created_at),
  KEY idx_security_event (event_type,created_at),
  CONSTRAINT fk_security_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;
