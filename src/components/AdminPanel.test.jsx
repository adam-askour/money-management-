import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../services/api';
import { AdminPanel } from './AdminPanel';

vi.mock('../services/api', () => ({
  api: { admin: vi.fn() },
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
});
