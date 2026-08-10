import { motion } from 'framer-motion';
import { ChevronRight, ReceiptText } from 'lucide-react';
import { formatDH } from '../utils/money';
import { StatusBadge } from './StatusBadge';

export function Ledger({ days, monthName, onOpen }) {
  return <section className="ledger" aria-labelledby="ledger-title">
    <div className="section-heading">
      <div><span className="eyebrow">{days[0]?.displayDate} — {days.at(-1)?.displayDate}</span><h2 id="ledger-title">The monthly<br/>money trail.</h2></div>
      <p className="ledger-intro"><strong>{monthName}.</strong><span>Every day has a place.</span><small>Open a row to review details or add an expense when the edit window is active.</small></p>
    </div>
    <div className="ledger-list">
      {days.map((day, index) => <motion.button type="button" className="day-row" key={day.date} onClick={() => onOpen(day)} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: Math.min(index * .018, .25) }} aria-label={`View ${day.fullDate} expense details`}>
        <span className="day-number">{String(index + 1).padStart(2, '0')}</span>
        <span className="day-date"><strong>{day.weekday}</strong><small>{day.displayDate}</small></span>
        <span className="day-expenses">{day.recorded ? <><ReceiptText size={15}/>{day.expenseCount} {day.expenseCount === 1 ? 'expense' : 'expenses'}{day.preview?.length ? ` · ${day.preview.join(', ')}` : ''}</> : 'No expenses recorded'}</span>
        <span className="day-total">{day.differenceCentimes != null || day.recorded ? formatDH(day.totalCentimes) : '—'}</span>
        <span className="day-difference">{day.differenceCentimes!=null ? formatDH(day.differenceCentimes, true) : '—'}</span>
        <span className="day-status"><StatusBadge type={day.budgetState}>{day.budgetMessage}</StatusBadge><StatusBadge type={day.editState === 'upcoming' ? 'upcoming' : day.editable ? 'under' : 'locked'} subtle>{day.editLabel}</StatusBadge></span>
        <ChevronRight className="row-arrow" aria-hidden="true"/>
      </motion.button>)}
    </div>
  </section>;
}
