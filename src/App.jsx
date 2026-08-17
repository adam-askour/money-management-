import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, LogOut, RefreshCw, Settings, ShieldCheck, WalletCards } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { LoginScreen, InviteScreen } from './components/AuthScreens';
import { BudgetEditor } from './components/BudgetEditor';
import { DayDrawer } from './components/DayDrawer';
import { Ledger } from './components/Ledger';
import { LegalFooter } from './components/LegalCenter';
import { Overview } from './components/Overview';
import { MonthSelector, monthLabel } from './components/MonthSelector';
import { useMoneyData } from './hooks/useMoneyData';
import { api } from './services/api';

export function App() {
  const [session,setSession]=useState({loading:true,user:null}),[month,setMonth]=useState(() => {
    const parts = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', timeZone: 'Africa/Casablanca' }).formatToParts(new Date());
    return `${parts.find(part => part.type === 'year').value}-${parts.find(part => part.type === 'month').value}`;
  });
  const [selected,setSelected]=useState(null),[toast,setToast]=useState(''),[budgetOpen,setBudgetOpen]=useState(false),[adminOpen,setAdminOpen]=useState(false);
  const { data,loading,error,reload }=useMoneyData(month,Boolean(session.user));
  const notify=useCallback(message=>{setToast(message);setTimeout(()=>setToast(''),2800);},[]);
  useEffect(()=>{api.bootstrap().then(result=>setSession({loading:false,user:result.user})).catch(()=>setSession({loading:false,user:null}));},[]);
  useEffect(()=>{if(data?.budget?.needsMonthlyGoal)setBudgetOpen(true);},[data]);
  if(session.loading)return <LoadingState/>;
  const token=new URLSearchParams(location.search).get('token');
  if(!session.user&&token)return <InviteScreen token={token} onAccepted={user=>setSession({loading:false,user})}/>;
  if(!session.user)return <LoginScreen onLogin={user=>setSession({loading:false,user})}/>;
  const logout=async()=>{await api.logout();setSession({loading:false,user:null});setSelected(null);};
  return <div className="app-shell"><div className="grain" aria-hidden="true"/><nav aria-label="Main navigation" inert={selected ? true : undefined}><a className="brand" href="#top"><WalletCards/>DAILY DH</a><MonthSelector value={month} onChange={next=>{setSelected(null);setMonth(next);}}/><div className="nav-actions"><button className="nav-icon" onClick={()=>setBudgetOpen(true)} title="Edit budget"><Settings size={17}/><span>Budget</span></button>{session.user.isAdmin&&<button className="nav-icon" onClick={()=>setAdminOpen(true)} title="Manage users"><ShieldCheck size={17}/><span>Admin</span></button>}<button className="nav-icon" onClick={logout} title="Sign out"><LogOut size={17}/><span>Sign out</span></button></div></nav><main id="top">
    {error?<ErrorState message={error} retry={reload}/>:loading||!data?<LoadingState/>:<><Overview summary={data.summary} serverToday={data.serverTodayLabel} monthName={monthLabel(month)} userName={session.user.name}/><div className="dotted-rule"/><div id="ledger"><Ledger days={data.days} monthName={monthLabel(month)} onOpen={setSelected}/></div></>}
  </main><LegalFooter/>
  <DayDrawer day={selected} onClose={()=>setSelected(null)} onChanged={reload} notify={notify}/>{budgetOpen&&data&&<BudgetEditor data={data} month={month} onClose={()=>setBudgetOpen(false)} onSaved={reload}/>} {adminOpen&&<AdminPanel onClose={()=>setAdminOpen(false)} notify={notify}/>}<AnimatePresence>{toast&&<motion.div className="toast" role="status" initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:10,opacity:0}}>✓ {toast}</motion.div>}</AnimatePresence></div>;
}

function LoadingState(){return <div className="page-state"><div className="loader-coin">DH</div><h1>Counting the month…</h1><p>Securely loading your ledger.</p></div>;}
function ErrorState({message,retry}){return <div className="page-state"><AlertTriangle/><h1>The ledger stayed closed.</h1><p>{message}</p><button className="primary-btn" onClick={retry}><RefreshCw/>Try again</button></div>;}
