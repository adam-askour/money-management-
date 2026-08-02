import { CalendarClock, Check, CircleMinus, LockKeyhole, PiggyBank, TriangleAlert } from 'lucide-react';

const icons = { under: PiggyBank, on: Check, over: TriangleAlert, empty: CircleMinus, locked: LockKeyhole, upcoming: CalendarClock };

export function StatusBadge({ type, children, subtle = false }) {
  const Icon = icons[type] || CalendarClock;
  return <span className={`status status--${type}${subtle ? ' status--subtle' : ''}`}><Icon aria-hidden="true" size={14} />{children}</span>;
}
