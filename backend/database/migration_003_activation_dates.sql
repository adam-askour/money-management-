ALTER TABLE users
  ADD COLUMN activated_at TIMESTAMP NULL AFTER is_active;

UPDATE users
SET activated_at = created_at
WHERE password_hash IS NOT NULL AND activated_at IS NULL;
