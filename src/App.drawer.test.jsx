import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { App } from './App';

const mocks = vi.hoisted(() => ({
  bootstrap: vi.fn(),
  day: vi.fn(),
  logout: vi.fn(),
  reload: vi.fn(),
}));

const selectedDay = {
  date: '2026-08-17',
  fullDate: 'Monday, August 17',
  displayDate: 'Aug 17',
  weekday: 'Monday',
  recorded: false,
  totalCentimes: 0,
  differenceCentimes: 10000,
  budgetState: 'under',
  budgetMessage: 'Under budget',
  editState: 'open',
  editable: true,
  editLabel: 'Open for editing',
  expenseCount: 0,
  preview: [],
};

const data = {
  serverTodayLabel: 'Monday, August 17',
  budget: { needsMonthlyGoal: false },
  days: [selectedDay],
  summary: {
    today: { totalCentimes: 0, differenceCentimes: 10000, state: 'under' },
    dailyBudgetCentimes: 10000,
    monthlyTargetCentimes: 310000,
    remainingCentimes: 310000,
    totalSpentCentimes: 0,
    totalSavedCentimes: 0,
    totalOverCentimes: 0,
    averageRecordedCentimes: 0,
    daysUnder: 0,
    daysOn: 0,
    daysOver: 0,
    daysEmpty: 1,
  },
};

vi.mock('./hooks/useMoneyData', () => ({
  useMoneyData: () => ({ data, loading: false, error: '', reload: mocks.reload }),
}));

vi.mock('./services/api', () => ({
  api: {
    bootstrap: mocks.bootstrap,
    day: mocks.day,
    logout: mocks.logout,
  },
}));

describe('expense drawer navigation isolation', () => {
  beforeAll(() => {
    vi.stubGlobal('IntersectionObserver', class {
      observe() {}
      unobserve() {}
      disconnect() {}
    });
  });

  afterAll(() => vi.unstubAllGlobals());
  afterEach(() => vi.clearAllMocks());

  it('disables navigation while open and closes without signing out', async () => {
    mocks.bootstrap.mockResolvedValue({
      user: { id: 1, name: 'Adam', isAdmin: false },
    });
    mocks.day.mockResolvedValue({
      ...selectedDay,
      totalCentimes: 0,
      dailyBudgetCentimes: 10000,
      expenses: [],
    });

    render(<App />);
    fireEvent.click(await screen.findByRole('button', { name: /view monday, august 17 expense details/i }));

    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('inert');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    await waitFor(() => expect(navigation).not.toHaveAttribute('inert'));
    expect(mocks.logout).not.toHaveBeenCalled();
  });
});
