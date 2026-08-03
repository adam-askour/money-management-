import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('authentication startup', () => {
  afterEach(() => vi.restoreAllMocks());

  it('shows the login form when bootstrap has no authenticated user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, data: { csrfToken: 'test-token', timezone: 'Africa/Casablanca', user: null } }),
    }));
    render(<App />);
    expect(await screen.findByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('keeps a loading state while an authenticated user month is still loading', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(url => {
      if (String(url).endsWith('/bootstrap')) return Promise.resolve({ ok: true, json: async () => ({ ok: true, data: { csrfToken: 'test-token', timezone: 'Africa/Casablanca', user: { id: 1, name: 'Adam', email: 'adam@local.invalid', role: 'admin', isAdmin: true } } }) });
      return new Promise(() => {});
    }));
    const { container } = render(<App />);
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/months/2026-08'), expect.any(Object)));
    expect(container.innerHTML).not.toBe('');
    expect(screen.getByText(/securely loading your ledger/i)).toBeInTheDocument();
  });
});
