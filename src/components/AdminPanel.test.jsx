import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../services/api';
import { AdminPanel } from './AdminPanel';

vi.mock('../services/api', () => ({
  api: { admin: vi.fn(), invite: vi.fn() },
}));

describe('admin panel closing', () => {
  beforeEach(() => api.admin.mockResolvedValue({ used: 1, limit: 50, currentUserId: 1, users: [], invitations: [] }));
  afterEach(cleanup);

  it('closes from the X button', () => {
    const onClose = vi.fn();
    render(<AdminPanel onClose={onClose} notify={vi.fn()}/>);
    fireEvent.pointerDown(screen.getByRole('button', { name: /close people & invites/i }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('closes when the backdrop is clicked', () => {
    const onClose = vi.fn();
    render(<AdminPanel onClose={onClose} notify={vi.fn()}/>);
    fireEvent.mouseDown(screen.getByTestId('admin-backdrop'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('stays open when the dialog itself is clicked', () => {
    const onClose = vi.fn();
    render(<AdminPanel onClose={onClose} notify={vi.fn()}/>);
    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('confirms when an invitation link is copied', async () => {
    const notify = vi.fn();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    api.invite.mockResolvedValue({ inviteUrl: 'https://example.test/invite/abc' });
    render(<AdminPanel onClose={vi.fn()} notify={notify}/>);

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Sam' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'sam@example.test' } });
    fireEvent.click(screen.getByRole('button', { name: /create invite/i }));
    await screen.findByRole('button', { name: /copy invitation link/i });
    fireEvent.click(screen.getByRole('button', { name: /copy invitation link/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledWith('https://example.test/invite/abc'));
    expect(await screen.findByRole('status')).toHaveTextContent('Link copied');
    expect(notify).toHaveBeenCalledWith('Invitation link copied.');
  });
});
