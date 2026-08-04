import { AnimatePresence, motion } from 'framer-motion';
import { Check, LoaderCircle, Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { formatDH, validateExpense } from '../utils/money';
import { StatusBadge } from './StatusBadge';

const blank = { description: '', amount: '' };

export function DayDrawer({ day, onClose, onChanged, notify }) {
  const [detail, setDetail] = useState(null), [form, setForm] = useState(blank), [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({}), [busy, setBusy] = useState(false), [loadError, setLoadError] = useState('');
  const closeRef = useRef(null);
  useEffect(() => { if (!day) return; setDetail(null); setLoadError(''); api.day(day.date).then(setDetail).catch(e => setLoadError(e.message)); setTimeout(() => closeRef.current?.focus(), 30); }, [day]);
  useEffect(() => { const key = e => e.key === 'Escape' && onClose(); document.addEventListener('keydown', key); return () => document.removeEventListener('keydown', key); }, [onClose]);
  if (!day) return null;
  const submit = async e => {
    e.preventDefault(); const next = validateExpense(form.description, form.amount); setErrors(next); if (Object.keys(next).length) return;
    setBusy(true); try {
      const payload = { description: form.description.trim(), amount: form.amount };
      if (editing) await api.updateExpense(editing, payload); else await api.addExpense(day.date, payload);
      setForm(blank); setEditing(null); setDetail(await api.day(day.date)); await onChanged(); notify(editing ? 'Expense updated.' : 'Expense added.');
    } catch (err) { setErrors(err.fields || { form: err.message }); } finally { setBusy(false); }
  };
  const remove = async expense => {
    if (expense.amountCentimes >= 10000 && !window.confirm(`Delete ${expense.description} for ${formatDH(expense.amountCentimes)}?`)) return;
    setBusy(true); try { await api.deleteExpense(expense.id); setDetail(await api.day(day.date)); await onChanged(); notify('Expense deleted.'); } catch(e) { setErrors({ form: e.message }); } finally { setBusy(false); }
  };
  const beginEdit = expense => { setEditing(expense.id); setForm({ description: expense.description, amount: (expense.amountCentimes / 100).toFixed(2) }); setErrors({}); };
  return <AnimatePresence><div className="drawer-layer" role="presentation"><motion.button className="scrim" aria-label="Close expense details" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}/><motion.aside className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}>
    <header><div><span className="eyebrow">Daily detail</span><h2 id="drawer-title">{day.fullDate}</h2></div><button ref={closeRef} className="icon-btn" onClick={onClose} aria-label="Close"><X/></button></header>
    {loadError ? <div className="state-card error"><strong>Couldn’t load this day</strong><p>{loadError}</p></div> : !detail ? <div className="drawer-loading"><LoaderCircle className="spin"/><span>Gathering expenses…</span></div> : <>
      <div className="drawer-summary"><div><span>Total spent</span><strong>{detail.recorded ? formatDH(detail.totalCentimes) : 'Not recorded'}</strong></div><div><span>Daily goal</span><strong>{detail.dailyBudgetCentimes==null?'Not set':formatDH(detail.dailyBudgetCentimes)}</strong></div><StatusBadge type={detail.budgetState}>{detail.budgetMessage}</StatusBadge></div>
      <div className="edit-notice"><StatusBadge type={detail.editable ? 'under' : detail.editState === 'upcoming' ? 'upcoming' : 'locked'}>{detail.editLabel}</StatusBadge>{detail.editable && <small>Changes are checked against the server clock.</small>}</div>
      <div className="expense-list" aria-live="polite">
        {detail.expenses.length === 0 ? <div className="empty"><ReceiptGlyph/><h3>No expenses yet.</h3><p>This day stays unrecorded until you add the first item.</p></div> : detail.expenses.map(expense => <article className="expense-item" key={expense.id}><div><strong>{expense.description}</strong><small>{formatDH(expense.amountCentimes)}</small></div>{detail.editable && <div><button className="icon-btn" onClick={() => beginEdit(expense)} aria-label={`Edit ${expense.description}`}><Pencil size={17}/></button><button className="icon-btn danger" onClick={() => remove(expense)} disabled={busy} aria-label={`Delete ${expense.description}`}><Trash2 size={17}/></button></div>}</article>)}
      </div>
      {detail.editable && <form className="expense-form" onSubmit={submit} noValidate><div className="form-title"><Plus size={18}/><strong>{editing ? 'Edit expense' : 'Add expense'}</strong>{editing && <button type="button" onClick={() => { setEditing(null); setForm(blank); setErrors({}); }}>Cancel</button>}</div><label>Expense name<input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} maxLength="120" placeholder="Coffee, taxi, lunch…" aria-invalid={!!errors.description} aria-describedby="description-error"/></label>{errors.description && <span className="field-error" id="description-error">{errors.description}</span>}<label>Amount in DH<div className="amount-input"><input inputMode="decimal" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" aria-invalid={!!errors.amount} aria-describedby="amount-error"/><span>DH</span></div></label>{errors.amount && <span className="field-error" id="amount-error">{errors.amount}</span>}{errors.form && <span className="field-error">{errors.form}</span>}<button className="primary-btn" disabled={busy}>{busy ? <><LoaderCircle className="spin"/>Saving…</> : <><Save size={17}/>{editing ? 'Save changes' : 'Add expense'}</>}</button></form>}
    </>}
  </motion.aside></div></AnimatePresence>;
}

function ReceiptGlyph(){ return <div className="receipt-glyph" aria-hidden="true"><span/><span/><span/><Check/></div>; }
