import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MonthSelector } from './MonthSelector';

describe('MonthSelector', () => {
  it('opens the complete month list and selects November 2026', () => {
    const onChange = vi.fn();
    render(<MonthSelector value="2026-08" onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: /aug.*2026/i }));
    expect(screen.getAllByRole('option')).toHaveLength(13);
    fireEvent.click(screen.getByRole('option', { name: /november 2026/i }));
    expect(onChange).toHaveBeenCalledWith('2026-11');
  });
});
