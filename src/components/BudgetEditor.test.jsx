import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BudgetEditor } from './BudgetEditor';

const baseData = {
  budget: {
    dailyBudgetCentimes: 5000,
    monthlyBudgetCentimes: 150000,
    effectiveFrom: '2026-08-01',
    effectiveTo: '2026-08-30',
    periodDays: 30,
    needsMonthlyGoal: true,
    firstSetup: false,
    goalEffectiveFrom: '2026-09-03',
    daysInMonth: 30,
  },
};

afterEach(cleanup);

describe('budget cycle editor', () => {
  it('carries prior goals into a new cycle', () => {
    render(<BudgetEditor data={baseData} month="2026-09" onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /start a new budget cycle/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/daily target/i)).toHaveValue('50.00');
    expect(screen.getByLabelText(/period budget/i)).toHaveValue('1500.00');
    expect(screen.getByLabelText(/cycle starts/i)).toHaveValue('2026-09-03');
    expect(screen.getByLabelText(/number of days/i)).toHaveValue(30);
  });

  it('uses a full cycle from the chosen start instead of prorating to month end', () => {
    const firstCycle={budget:{...baseData.budget,dailyBudgetCentimes:null,monthlyBudgetCentimes:null,firstSetup:true,goalEffectiveFrom:'2026-08-15',periodDays:31}};
    render(<BudgetEditor data={firstCycle} month="2026-08" onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /set your first budget cycle/i })).toBeInTheDocument();
    expect(screen.getByText((_, element) => element.tagName === 'SMALL' && element.textContent.includes('through 2026-09-14'))).toBeInTheDocument();
  });

  it('suggests a safe daily target and blocks a target above the period budget', () => {
    const firstCycle={budget:{...baseData.budget,dailyBudgetCentimes:null,monthlyBudgetCentimes:null,firstSetup:true,goalEffectiveFrom:'2026-09-03',periodDays:30}};
    render(<BudgetEditor data={firstCycle} month="2026-09" onClose={vi.fn()} onSaved={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/period budget/i), { target: { value: '3000' } });
    expect(screen.getByLabelText(/daily target/i)).toHaveValue('100.00');

    fireEvent.change(screen.getByLabelText(/daily target/i), { target: { value: '120' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Current period budget 3000.00 DH');
    expect(screen.getByRole('alert')).toHaveTextContent('Maximum daily target 100.00 DH');
    expect(screen.getByRole('alert')).toHaveTextContent('Budget needed for 120.00 DH/day 3600.00 DH');
    expect(screen.getByRole('button', { name: /save budget cycle/i })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/daily target/i), { target: { value: '90' } });
    expect(screen.getByRole('button', { name: /save budget cycle/i })).toBeEnabled();
  });
});
