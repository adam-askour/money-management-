import { useEffect, useState } from 'react';
import { ShieldCheck, X } from 'lucide-react';

export function LegalFooter({ compact = false }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return undefined;
    const close = event => event.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [open]);
  return <>
    <footer className={compact ? 'legal-footer legal-footer--compact' : 'legal-footer'}><span>DAILY DH · PRIVATE LEDGER</span><button type="button" onClick={() => setOpen(true)}>Privacy, cookies & legal</button>{!compact && <span>Africa/Casablanca time · Authenticated & securely calculated</span>}</footer>
    {open && <div className="legal-layer" role="presentation" onMouseDown={event => event.target === event.currentTarget && setOpen(false)}><section className="legal-panel" role="dialog" aria-modal="true" aria-labelledby="legal-title">
      <header><div><span className="eyebrow"><ShieldCheck size={15}/> Privacy & legal</span><h2 id="legal-title">Your data.<br/>Plainly explained.</h2></div><button type="button" className="icon-btn" onClick={() => setOpen(false)} aria-label="Close legal information"><X/></button></header>
      <p className="legal-updated">Last updated: 4 August 2026</p>
      <article><h3>Who operates Daily DH</h3><p>The data controller and site operator is <strong>Adam Askour</strong>, Morocco. Privacy and data-rights requests can be sent to <a href="mailto:adamaskour@outlook.com">adamaskour@outlook.com</a>.</p></article>
      <article><h3>What we collect and why</h3><p>Daily DH processes your name, email address, password hash, account and invitation details, expense descriptions and amounts, budgets, login timestamps, and security records derived from your IP address. We use this information only to provide the private ledger, authenticate users, calculate budgets, administer invitations, prevent abuse, and protect the service.</p></article>
      <article><h3>Hosting and recipients</h3><p>Access is limited to you and the site administrator as needed to operate the service. Infrastructure provider Alwaysdata hosts the application and database in France and may process technical data as a service provider. We do not sell personal data and do not use advertising or analytics trackers.</p></article>
      <article><h3>Retention and security</h3><p>Account and ledger data are kept while your account is active and are deleted when the administrator deletes your account, subject to any legal preservation duty. Expired invitation data is periodically removed. Security events are retained for no more than 12 months. Passwords are stored as one-way hashes; sessions use HTTPS, HttpOnly, Secure and SameSite cookies; access is authenticated and scoped by user.</p></article>
      <article><h3>Strictly necessary cookie</h3><p>Daily DH uses one session cookie to keep you signed in and protect account actions. It expires when the browsing session ends or after inactivity. Because it is required for the requested private service, disabling it prevents login. No advertising, preference, or analytics cookies are used.</p></article>
      <article><h3>Your rights</h3><p>Under Moroccan Law 09-08, you may request access to or correction of your personal data, and object for legitimate reasons. You may also request account and ledger deletion. Contact the operator using the email above and include enough information to verify your identity. You may lodge a complaint with Morocco’s CNDP.</p></article>
      <article className="legal-alert"><h3>CNDP status</h3><p>No CNDP declaration or authorization receipt number has yet been issued for Daily DH. The operator should notify the processing to the CNDP and request the applicable authorization for transferring or hosting personal data in France before expanding use of the service.</p></article>
      <article><h3>Service terms</h3><p>Daily DH is an invite-only record-keeping tool provided as available. Keep your login confidential and enter only information you are authorized to record. The calculations are informational and are not financial, accounting, tax, or legal advice. The operator may suspend access to protect users or the service.</p></article>
    </section></div>}
  </>;
}
