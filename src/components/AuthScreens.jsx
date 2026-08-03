import { LoaderCircle, LockKeyhole, UserPlus, WalletCards } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '../services/api';

export function LoginScreen({ onLogin }) {
  const [form,setForm]=useState({email:'',password:''}),[errors,setErrors]=useState({}),[busy,setBusy]=useState(false);
  const submit=async e=>{e.preventDefault();setBusy(true);setErrors({});try{onLogin(await api.login(form));}catch(err){setErrors(err.fields||{form:err.message});}finally{setBusy(false);}};
  return <AuthFrame title="Welcome back." text="Sign in to open your private ledger."><form className="auth-form" onSubmit={submit}><label>Email<input type="email" autoComplete="email" maxLength="254" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>{errors.email&&<span className="field-error">{errors.email}</span>}<label>Password<input type="password" autoComplete="current-password" maxLength="128" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label>{errors.password&&<span className="field-error">{errors.password}</span>}{errors.form&&<span className="field-error">{errors.form}</span>}<button className="primary-btn" disabled={busy}>{busy?<><LoaderCircle className="spin"/>Signing in…</>:<><LockKeyhole size={17}/>Sign in</>}</button></form></AuthFrame>;
}

export function InviteScreen({ token, onAccepted }) {
  const [invite,setInvite]=useState(null),[password,setPassword]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  useEffect(()=>{api.invitation(token).then(setInvite).catch(e=>setError(e.message));},[token]);
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{onAccepted(await api.acceptInvitation(token,password));history.replaceState({},'',location.pathname);}catch(err){setError(err.fields?.password||err.message);}finally{setBusy(false);}};
  return <AuthFrame title={invite?`Hello, ${invite.name}.`:'Checking invitation…'} text={invite?`Create a password to activate ${invite.email}.`:'This will only take a moment.'}>{error?<div className="state-card error">{error}</div>:invite?<form className="auth-form" onSubmit={submit}><label>Create password<input type="password" autoComplete="new-password" maxLength="128" value={password} onChange={e=>setPassword(e.target.value)}/></label><small>At least 12 characters with uppercase, lowercase, and a number.</small><button className="primary-btn" disabled={busy}><UserPlus size={17}/>{busy?'Activating…':'Activate account'}</button></form>:<LoaderCircle className="spin"/>}</AuthFrame>;
}

function AuthFrame({title,text,children}){return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><WalletCards/>DAILY DH</div><span className="eyebrow">Private · Invite only</span><h1>{title}</h1><p>{text}</p>{children}</section></main>;}
