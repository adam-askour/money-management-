export const formatDH = (centimes, signed = false) => {
  const value = Number(centimes || 0) / 100;
  const sign = signed && value > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)} DH`;
};

export const normalizeMoneyInput = value => String(value ?? '').replace(',', '.');

export const moneyToCentimes = value => {
  const normalized = normalizeMoneyInput(value).trim();
  return /^\d+(?:\.\d{1,2})?$/.test(normalized) ? Math.round(Number(normalized) * 100) : null;
};

export function budgetState(total, budget, { recorded = true, closed = true } = {}) {
  if (budget == null) return { key: 'empty', difference: null, label: 'Set your budget' };
  if (!recorded && !closed) return { key: 'empty', difference: null, label: 'No expenses recorded' };
  const difference = budget - total;
  if (difference > 0) return { key: 'under', difference, label: `Saved ${formatDH(difference)}` };
  if (difference < 0) return { key: 'over', difference, label: `Over budget by ${formatDH(Math.abs(difference))}` };
  return { key: 'on', difference: 0, label: 'On budget' };
}

export function validateExpense(description, amount) {
  const errors = {};
  const clean = description.trim();
  if (!clean) errors.description = 'Enter an expense name.';
  else if (clean.length > 120) errors.description = 'Use 120 characters or fewer.';
  const centimes = moneyToCentimes(amount);
  if (centimes == null) errors.amount = 'Enter a valid amount with up to 2 decimals.';
  else {
    if (centimes < 1) errors.amount = 'Amount must be at least 0.01 DH.';
    if (centimes > 10_000_000) errors.amount = 'Amount cannot exceed 100,000 DH.';
  }
  return errors;
}
