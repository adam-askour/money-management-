import { describe, expect, it } from 'vitest';
import { budgetState, moneyToCentimes, validateExpense } from './money';

describe('budget calculations', () => {
  it('reports saved money below budget', () => expect(budgetState(3500, 4000)).toEqual({ key: 'under', difference: 500, label: 'Saved 5 DH' }));
  it('reports exactly on budget', () => expect(budgetState(4000, 4000)).toEqual({ key: 'on', difference: 0, label: 'On budget' }));
  it('reports over budget', () => expect(budgetState(4700, 4000)).toEqual({ key: 'over', difference: -700, label: 'Over budget by 7 DH' }));
  it('counts a closed day with no expenses as saving its full budget', () => expect(budgetState(0, 4000, { recorded: false, closed: true })).toEqual({ key: 'under', difference: 4000, label: 'Saved 40 DH' }));
  it('does not count a zero-expense day while expenses can still be added', () => expect(budgetState(0, 4000, { recorded: false, closed: false })).toEqual({ key: 'empty', difference: null, label: 'No expenses recorded' }));
  it('sums multiple expense centime values safely', () => expect([1200, 1800, 2500].reduce((a, b) => a + b, 0)).toBe(5500));
});

describe('expense validation', () => {
  it.each([['3.1', 310], ['4.50', 450], ['0.01', 1], ['3,25', 325]])('accepts %s as %i centimes', (amount, centimes) => {
    expect(validateExpense('Taxi', amount)).toEqual({});
    expect(moneyToCentimes(amount)).toBe(centimes);
  });
  it.each(['-4', 'NaN', '1.234', 'Infinity', '100000.01'])('rejects invalid amount %s', amount => expect(validateExpense('Taxi', amount).amount).toBeTruthy());
  it('treats markup as text input without executing it', () => expect(validateExpense('<img src=x onerror=alert(1)>', '5')).toEqual({}));
  it('accepts SQL-shaped text as data', () => expect(validateExpense("Lunch'); DROP TABLE expenses;--", '12')).toEqual({}));
});
