import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { BudgetEditor } from './BudgetEditor';

const baseData = {
  budget: {
    dailyBudgetCentimes: 5000,
    monthlyBudgetCentimes: 150000,
    effectiveFrom: '2026-08-01',
    needsMonthlyGoal: true,
    firstSetup: false,
    goalEffectiveFrom: '2026-09-01',
    proratedFirstMonth: false,
    remainingDays: 30,
    daysInMonth: 30,
  },
};

describe('monthly goal editor', () => {
  it('announces a new month and carries prior goals forward as defaults', () => {
    render(<BudgetEditor data={baseData} month="2026-09" onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /new month, new goals/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/daily target/i)).toHaveValue('50.00');
    expect(screen.getByLabelText(/monthly goal/i)).toHaveValue('1500.00');
    expect(screen.getByLabelText(/effective from/i)).toHaveValue('2026-09-01');
  });

  it('explains the prorated first-month target', () => {
    const firstMonth={budget:{...baseData.budget,dailyBudgetCentimes:null,monthlyBudgetCentimes:null,firstSetup:true,goalEffectiveFrom:'2026-08-15',proratedFirstMonth:true,remainingDays:17,daysInMonth:31}};
    render(<BudgetEditor data={firstMonth} month="2026-08" onClose={vi.fn()} onSaved={vi.fn()} />);
    expect(screen.getByRole('heading', { name: /set your first goals/i })).toBeInTheDocument();
    expect(screen.getByText(/17 remaining days/i)).toBeInTheDocument();
  });
});
