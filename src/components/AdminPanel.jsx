import { Check, Copy, Link, Trash2, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api';

export function AdminPanel({ onClose, notify }) {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  const load = useCallback(() => api.admin().then(setData).catch(error => setErrors({ form: error.message })), []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const invite = async event => {
    event.preventDefault();
    setErrors({});
    try {
      const result = await api.invite(form);
      setLink(result.inviteUrl);
      setForm({ name: '', email: '' });
      await load();
    } catch (error) { setErrors(error.fields || { form: error.message }); }
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      notify('Invitation link copied.');
      window.setTimeout(() => setCopied(false), 2800);
    } catch {
      setErrors({ form: 'The invitation link could not be copied. Please copy it manually.' });
    }
  };
  const removeUser = async user => {
    if (!window.confirm(`Delete ${user.name}'s account and all of its data?`)) return;
    try { await api.deleteUser(user.id); await load(); notify('User deleted.'); }
    catch (error) { setErrors({ form: error.message }); }
  };
  const removeInvite = async invitation => {
    if (!window.confirm(`Delete the invitation for ${invitation.email}?`)) return;
    try { await api.deleteInvitation(invitation.id); await load(); notify('Invitation deleted.'); }
    catch (error) { setErrors({ form: error.message }); }
  };

  return <div
    className="modal-layer"
    data-testid="admin-backdrop"
    onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}
  >
    <section className="settings-modal admin-modal" role="dialog" aria-modal="true" aria-labelledby="admin-title">
      <header>
        <div><span className="eyebrow">Administrator</span><h2 id="admin-title">People & invites</h2></div>
        <button
          type="button"
          className="icon-btn admin-modal__close"
          onPointerDown={event => { event.preventDefault(); event.stopPropagation(); onClose(); }}
          aria-label="Close People & invites"
        ><X/></button>
      </header>
      {data && <p>{data.used} of {data.limit} account places used.</p>}
      <form className="invite-form" onSubmit={invite}>
        <input aria-label="Name" placeholder="Name" maxLength="80" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })}/>
        <input aria-label="Email" type="email" placeholder="Email" maxLength="254" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })}/>
        <button className="primary-btn"><Link size={16}/>Create invite</button>
      </form>
      {Object.values(errors).map(error => <span className="field-error" key={error}>{error}</span>)}
      {link && <div className="invite-link"><code>{link}</code><div className="copy-control">{copied && <span className="copy-confirmation" role="status"><Check size={14}/>Link copied</span>}<button type="button" className="icon-btn" onClick={copy} aria-label="Copy invitation link">{copied?<Check size={16}/>:<Copy size={16}/>}</button></div></div>}
      <div className="admin-list">{data?.users.map(user => <article key={user.id}><div><strong>{user.name}</strong><small>{user.email} · {user.role}</small></div>{user.id !== data.currentUserId && <button type="button" className="icon-btn danger" onClick={() => removeUser(user)} aria-label={`Delete ${user.name}`}><Trash2 size={16}/></button>}</article>)}</div>
      <h3>Pending invitations</h3>
      <div className="admin-list">{data?.invitations.map(invitation => <article key={invitation.id}><div><strong>{invitation.name}</strong><small>{invitation.email} · Pending</small></div><button type="button" className="icon-btn danger" onClick={() => removeInvite(invitation)} aria-label={`Delete invitation for ${invitation.email}`}><Trash2 size={16}/></button></article>)}</div>
    </section>
  </div>;
}
