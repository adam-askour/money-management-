import { motion, useReducedMotion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, CalendarDays, Gauge, PiggyBank, ReceiptText, Target } from 'lucide-react';
import { formatDH } from '../utils/money';
import { InteractiveCoin } from './InteractiveCoin';

function Stat({ icon: Icon, label, value, tone = '' }) {
  return <motion.article className={`stat ${tone}`} whileHover={{ y: -3 }}><Icon size={18} aria-hidden="true"/><span>{label}</span><strong>{value}</strong></motion.article>;
}

export function Overview({ summary, serverToday, monthName, userName }) {
  const reduced = useReducedMotion();
  const netBudgetCentimes = summary.totalSavedCentimes - summary.totalOverCentimes;

  return <section className="overview" aria-labelledby="overview-title">
    <div className="hero-copy">
      <span className="eyebrow"><span className="live-dot"/> Private daily ledger · {serverToday}</span>
      <h1 id="overview-title">Welcome back, <em>{userName}.</em><br/>How much did you spend today?</h1>
      <p>Small entries. A clearer month. Your {monthName} money story, counted in dirhams.</p>
    </div>
    <motion.div className="orbit" initial={reduced ? false : { opacity: 0, scale: .88, rotate: -8 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: .75, ease: [.19, 1, .22, 1] }}><InteractiveCoin /></motion.div>
    <div className="today-strip">
      <Stat icon={ReceiptText} label="Today" value={formatDH(summary.today.totalCentimes)} />
      <Stat icon={Target} label="Daily goal" value={summary.dailyBudgetCentimes==null?'Not set':formatDH(summary.dailyBudgetCentimes)} />
      <Stat icon={Gauge} label="Difference" value={summary.today.differenceCentimes!=null ? formatDH(summary.today.differenceCentimes, true) : '—'} tone={summary.today.state}/>
    </div>
    <motion.section className="budget-balance" aria-labelledby="budget-balance-title" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="budget-balance__intro">
        <span className="eyebrow">Automatic calculation</span>
        <h2 id="budget-balance-title">Your budget balance.</h2>
        <p>Calculated from recorded days and closed zero-expense days in {monthName}.</p>
      </div>
      <div className="budget-balance__figures">
        <div className="balance-figure balance-figure--saved"><PiggyBank aria-hidden="true"/><span>You saved</span><strong>{formatDH(summary.totalSavedCentimes)}</strong></div>
        <div className="balance-figure balance-figure--over"><ArrowUpRight aria-hidden="true"/><span>You went over</span><strong>{formatDH(summary.totalOverCentimes)}</strong></div>
        <div className={`balance-figure balance-figure--net ${netBudgetCentimes >= 0 ? 'is-positive' : 'is-negative'}`}><Gauge aria-hidden="true"/><span>Net result</span><strong>{formatDH(netBudgetCentimes, true)}</strong><small>{netBudgetCentimes >= 0 ? 'Overall saved' : 'Overall over budget'}</small></div>
      </div>
    </motion.section>
    <div className="stats-grid">
      <Stat icon={CalendarDays} label="Spent this month" value={formatDH(summary.totalSpentCentimes)} />
      <Stat icon={Target} label="Period budget" value={summary.monthlyTargetCentimes==null?'Not set':formatDH(summary.monthlyTargetCentimes)} />
      <Stat icon={ArrowDownRight} label="Period remaining" value={summary.remainingCentimes==null?'Not set':formatDH(summary.remainingCentimes)} />
      <Stat icon={Gauge} label="Average / recorded day" value={formatDH(summary.averageRecordedCentimes)} />
    </div>
    <div className="count-row" aria-label="Monthly day counts">
      <span><b>{summary.daysUnder}</b> under budget</span><span><b>{summary.daysOn}</b> on budget</span><span><b>{summary.daysOver}</b> over budget</span><span><b>{summary.daysEmpty}</b> not counted yet</span>
    </div>
  </section>;
}
