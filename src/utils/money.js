export const formatDH = (centimes, signed = false) => {
  const value = Number(centimes || 0) / 100;
  const sign = signed && value > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('en', { maximumFractionDigits: 2 }).format(value)} DH`;
};

export function budgetState(total, budget, recorded = true) {
  if (!recorded) return { key: 'empty', difference: null, label: 'No expenses recorded' };
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
  const normalized = String(amount).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) errors.amount = 'Enter a valid amount with up to 2 decimals.';
  else {
    const centimes = Math.round(Number(normalized) * 100);
    if (centimes < 1) errors.amount = 'Amount must be at least 0.01 DH.';
    if (centimes > 10_000_000) errors.amount = 'Amount cannot exceed 100,000 DH.';
  }
  return errors;
}
