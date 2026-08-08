import { AlertTriangle, CalendarDays, Save, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';

const toCentimes = value => /^\d+(?:\.\d{1,2})?$/.test(value) ? Math.round(Number(value) * 100) : null;
const dh = centimes => (centimes / 100).toFixed(2);
const monthDays = date => {
  const [year, month] = date.split('-').map(Number);
  return year && month ? new Date(Date.UTC(year, month, 0)).getUTCDate() : 30;
};
const addDays = (date, days) => {
  const [year, month, day] = date.split('-').map(Number);
  const result = new Date(Date.UTC(year, month - 1, day + days));
  return result.toISOString().slice(0, 10);
};

export function BudgetEditor({ data, month, onClose, onSaved }) {
  const isFirstSetup = data.budget.firstSetup ?? data.budget.dailyBudgetCentimes == null;
  const isNewCycle = data.budget.needsMonthlyGoal && !isFirstSetup;
  const initialStart = !data.budget.needsMonthlyGoal && data.budget.effectiveFrom ? data.budget.effectiveFrom : (data.budget.goalEffectiveFrom || `${month}-01`);
  const initialDays = data.budget.periodDays || monthDays(initialStart);
  const [form, setForm] = useState({ dailyBudget: '', monthlyBudget: '', effectiveFrom: initialStart, periodDays: String(initialDays) });
  const [dailyTouched, setDailyTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({
      dailyBudget: data.budget.dailyBudgetCentimes == null ? '' : dh(data.budget.dailyBudgetCentimes),
      monthlyBudget: data.budget.monthlyBudgetCentimes == null ? '' : dh(data.budget.monthlyBudgetCentimes),
      effectiveFrom: initialStart,
      periodDays: String(initialDays),
    });
    setDailyTouched(false);
  }, [data, month, initialStart, initialDays]);
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const periodDays = Number.parseInt(form.periodDays, 10);
  const monthlyCentimes = toCentimes(form.monthlyBudget);
  const dailyCentimes = toCentimes(form.dailyBudget);
  const suggestedCentimes = monthlyCentimes && periodDays > 0 ? Math.floor(monthlyCentimes / periodDays) : null;
  const requiredCentimes = dailyCentimes && periodDays > 0 ? dailyCentimes * periodDays : null;
  const dailyTooHigh = suggestedCentimes != null && requiredCentimes > monthlyCentimes;
  const cycleEnd = useMemo(() => form.effectiveFrom && periodDays > 0 && periodDays <= 366 ? addDays(form.effectiveFrom, periodDays - 1) : '', [form.effectiveFrom, periodDays]);

  const applySuggestion = next => {
    const nextMonthly = 'monthlyBudget' in next ? next.monthlyBudget : form.monthlyBudget;
    const nextDays = Number.parseInt('periodDays' in next ? next.periodDays : form.periodDays, 10);
    const cents = toCentimes(nextMonthly);
    return !dailyTouched && cents && nextDays > 0 ? { ...form, ...next, dailyBudget: dh(Math.floor(cents / nextDays)) } : { ...form, ...next };
  };
  const submit = async event => {
    event.preventDefault();
    if (dailyTooHigh) {
      setErrors({ dailyBudget: `This target needs ${dh(requiredCentimes)} DH for the cycle. Use ${dh(suggestedCentimes)} DH or less per day, or increase the period budget to at least ${dh(requiredCentimes)} DH.` });
      return;
    }
    setBusy(true); setErrors({});
    try { await api.updateBudget({ ...form, periodDays }); await onSaved(); onClose(); }
    catch (error) { setErrors(error.fields || { form: error.message }); }
    finally { setBusy(false); }
  };

  const title = isFirstSetup ? 'Set your first budget cycle' : isNewCycle ? 'Start a new budget cycle' : 'Edit your budget cycle';
  return <div className="modal-layer"><button className="scrim" aria-label="Close" onClick={onClose}/><section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="budget-title"><header><div><span className="eyebrow">Flexible spending period</span><h2 id="budget-title">{title}</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close budget settings"><X/></button></header><p>Choose when this budget starts and how many days it should cover. We suggest a safe daily target, and you can lower it whenever you prefer.</p><form className="auth-form" onSubmit={submit}>
    <label>Period budget (DH)<input aria-describedby="budget-suggestion" inputMode="decimal" value={form.monthlyBudget} onChange={event => setForm(applySuggestion({ monthlyBudget: event.target.value }))}/></label>
    {errors.monthlyBudget&&<span className="field-error">{errors.monthlyBudget}</span>}
    <div className="budget-period-grid"><label>Cycle starts<input type="date" value={form.effectiveFrom} onChange={event => { const effectiveFrom=event.target.value; const periodDays=String(monthDays(effectiveFrom)); const cents=toCentimes(form.monthlyBudget); setDailyTouched(false); setForm({ ...form, effectiveFrom, periodDays, dailyBudget:cents?dh(Math.floor(cents/Number(periodDays))):form.dailyBudget }); }}/></label><label>Number of days<input type="number" inputMode="numeric" min="1" max="366" value={form.periodDays} onChange={event => setForm(applySuggestion({ periodDays: event.target.value }))}/></label></div>
    {errors.effectiveFrom&&<span className="field-error">{errors.effectiveFrom}</span>}{errors.periodDays&&<span className="field-error">{errors.periodDays}</span>}
    {cycleEnd&&<small className="cycle-range"><CalendarDays size={15}/>This cycle runs from <strong>{form.effectiveFrom}</strong> through <strong>{cycleEnd}</strong> ({periodDays} days).</small>}
    <label>Daily target (DH)<input inputMode="decimal" value={form.dailyBudget} onChange={event => { setDailyTouched(true); setForm({ ...form, dailyBudget: event.target.value }); }}/></label>
    {suggestedCentimes!=null&&(dailyTooHigh?<div id="budget-suggestion" className="budget-warning" role="alert"><div className="budget-warning__title"><AlertTriangle size={18}/><strong>Your daily target is too high for this cycle</strong></div><p>At {dh(dailyCentimes)} DH per day for {periodDays} days, you would need {dh(requiredCentimes)} DH.</p><div className="budget-warning__rows"><span>Current period budget <strong>{dh(monthlyCentimes)} DH</strong></span><span>Maximum daily target <strong>{dh(suggestedCentimes)} DH</strong></span><span>Budget needed for {dh(dailyCentimes)} DH/day <strong>{dh(requiredCentimes)} DH</strong></span></div><p className="budget-warning__action">Lower the daily target or increase the period budget before saving.</p></div>:<small id="budget-suggestion" className="budget-suggestion">Suggested daily target: <strong>{dh(suggestedCentimes)} DH</strong>. Your current target uses {dh(requiredCentimes||0)} DH across this cycle.</small>)}
    {errors.dailyBudget&&<span className="field-error">{errors.dailyBudget}</span>}{errors.form&&<span className="field-error">{errors.form}</span>}
    <button className="primary-btn" disabled={busy||dailyTooHigh}><Save size={17}/>{busy?'Saving…':'Save budget cycle'}</button>
  </form></section></div>;
}
