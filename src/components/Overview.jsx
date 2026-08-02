import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, CalendarDays, Gauge, PiggyBank, ReceiptText, Target } from 'lucide-react';
import { formatDH } from '../utils/money';
import { InteractiveCoin } from './InteractiveCoin';

function Stat({ icon: Icon, label, value, tone = '' }) {
  return <motion.article className={`stat ${tone}`} whileHover={{ y: -3 }}><Icon size={18} aria-hidden="true"/><span>{label}</span><strong>{value}</strong></motion.article>;
}

export function Overview({ summary, serverToday }) {
  const reduced = useReducedMotion();
  return <section className="overview" aria-labelledby="overview-title">
    <div className="hero-copy">
      <span className="eyebrow"><span className="live-dot"/> Private daily ledger · {serverToday}</span>
      <h1 id="overview-title">Welcome back, <em>Adam.</em><br/>How much did you spend today?</h1>
      <p>Small entries. A clearer month. Your August money story, counted in dirhams.</p>
    </div>
    <motion.div className="orbit" initial={reduced ? false : { opacity: 0, scale: .88, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .75, ease: [.19, 1, .22, 1] }}><InteractiveCoin /></motion.div>
    <div className="today-strip">
      <Stat icon={ReceiptText} label="Today" value={summary.today.recorded ? formatDH(summary.today.totalCentimes) : 'Not recorded'} />
      <Stat icon={Target} label="Daily goal" value={formatDH(summary.dailyBudgetCentimes)} />
      <Stat icon={Gauge} label="Difference" value={summary.today.recorded ? formatDH(summary.today.differenceCentimes, true) : '—'} tone={summary.today.state}/>
    </div>
    <div className="stats-grid">
      <Stat icon={CalendarDays} label="Spent this month" value={formatDH(summary.totalSpentCentimes)} />
      <Stat icon={Target} label="Monthly target" value={formatDH(summary.monthlyTargetCentimes)} />
      <Stat icon={PiggyBank} label="Total saved" value={formatDH(summary.totalSavedCentimes)} tone="under" />
      <Stat icon={ArrowUpRight} label="Total over" value={formatDH(summary.totalOverCentimes)} tone="over" />
      <Stat icon={ArrowDownRight} label="Budget remaining" value={formatDH(summary.remainingCentimes)} />
      <Stat icon={Gauge} label="Average / recorded day" value={formatDH(summary.averageRecordedCentimes)} />
    </div>
    <div className="count-row" aria-label="Monthly day counts">
      <span><b>{summary.daysUnder}</b> under budget</span><span><b>{summary.daysOn}</b> on budget</span><span><b>{summary.daysOver}</b> over budget</span><span><b>{summary.daysEmpty}</b> not recorded</span>
    </div>
  </section>;
}
