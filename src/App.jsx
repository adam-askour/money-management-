import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, WalletCards } from 'lucide-react';
import { useCallback, useState } from 'react';
import { DayDrawer } from './components/DayDrawer';
import { Ledger } from './components/Ledger';
import { Overview } from './components/Overview';
import { useMoneyData } from './hooks/useMoneyData';

export function App() {
  const { data, loading, error, reload } = useMoneyData();
  const [selected, setSelected] = useState(null), [toast, setToast] = useState('');
  const notify = useCallback(message => { setToast(message); setTimeout(() => setToast(''), 2800); }, []);
  return <div className="app-shell"><div className="grain" aria-hidden="true"/><nav aria-label="Main navigation"><a className="brand" href="#top"><WalletCards/>DAILY DH</a><span>AUG · 2026</span><a href="#ledger" className="pill-link">View ledger</a></nav><main id="top">
    {loading ? <LoadingState/> : error ? <ErrorState message={error} retry={reload}/> : <><Overview summary={data.summary} serverToday={data.serverTodayLabel}/><div className="dotted-rule"/><div id="ledger"><Ledger days={data.days} onOpen={setSelected}/></div></>}
  </main><footer><span>DAILY DH · PRIVATE LEDGER</span><span>Europe/Amsterdam time · Securely calculated</span></footer>
  <DayDrawer day={selected} onClose={() => setSelected(null)} onChanged={reload} notify={notify}/><AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}>✓ {toast}</motion.div>}</AnimatePresence></div>;
}

function LoadingState(){ return <div className="page-state"><div className="loader-coin">DH</div><h1>Counting the month…</h1><p>Securely loading Adam’s ledger.</p></div>; }
function ErrorState({ message, retry }){ return <div className="page-state"><AlertTriangle/><h1>The ledger stayed closed.</h1><p>{message}</p><button className="primary-btn" onClick={retry}><RefreshCw/>Try again</button></div>; }
