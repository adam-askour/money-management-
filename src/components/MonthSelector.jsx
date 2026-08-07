import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const MONTHS = Array.from({ length: 13 }, (_, index) => {
  const date = new Date(Date.UTC(2026, 7 + index, 1));
  return {
    value: date.toISOString().slice(0, 7),
    label: new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date),
    compact: new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(date).toUpperCase().replace(' ', ' · '),
  };
});

export function MonthSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const selected = MONTHS.find(month => month.value === value) || MONTHS[0];

  useEffect(() => {
    const outside = event => !root.current?.contains(event.target) && setOpen(false);
    const escape = event => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previousOverflow; };
  }, [open]);

  return <div className="month-picker" ref={root}>
    <button type="button" className="month-trigger" onClick={() => setOpen(current => !current)} aria-haspopup="listbox" aria-expanded={open}>
      {selected.compact}<ChevronDown size={14} aria-hidden="true" />
    </button>
    <AnimatePresence>{open && <motion.div className="month-menu" role="listbox" aria-label="Choose financial month" initial={{ opacity: 0, y: -8, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -5, scale: .98 }} transition={{ duration: .2 }}>
      {MONTHS.map(month => <button type="button" role="option" aria-selected={month.value === value} key={month.value} onClick={() => { onChange(month.value); setOpen(false); }}>
        <span>{month.label}</span>{month.value === value && <Check size={15} aria-hidden="true" />}
      </button>)}
    </motion.div>}</AnimatePresence>
  </div>;
}

export function monthLabel(value) {
  return MONTHS.find(month => month.value === value)?.label || value;
}
