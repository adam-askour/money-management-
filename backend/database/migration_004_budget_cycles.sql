ALTER TABLE budgets
  ADD COLUMN period_days SMALLINT UNSIGNED NULL AFTER monthly_budget_centimes;

UPDATE budgets
SET period_days = CASE
  WHEN effective_to IS NOT NULL THEN LEAST(366, GREATEST(1, DATEDIFF(effective_to, effective_from) + 1))
  ELSE DAY(LAST_DAY(effective_from))
END
WHERE period_days IS NULL;

ALTER TABLE budgets
  MODIFY period_days SMALLINT UNSIGNED NOT NULL,
  ADD CONSTRAINT chk_budget_period_days CHECK (period_days BETWEEN 1 AND 366);
