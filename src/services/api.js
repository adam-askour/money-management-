const BASE = import.meta.env.VITE_API_BASE_URL || '/api';
let csrfToken = '';

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...options.headers };
  if (options.body) headers['Content-Type'] = 'application/json';
  if (options.method && !['GET', 'HEAD'].includes(options.method)) headers['X-CSRF-Token'] = csrfToken;
  const response = await fetch(`${BASE}${path}`, { credentials: 'include', ...options, headers });
  const payload = await response.json().catch(() => ({ ok: false, error: { message: 'The server returned an unreadable response.' } }));
  if (!response.ok) throw Object.assign(new Error(payload.error?.message || 'Something went wrong.'), { status: response.status, fields: payload.error?.fields });
  return payload.data;
}

export const api = {
  async bootstrap() { const data = await request('/bootstrap'); csrfToken = data.csrfToken; return data; },
  async login(body) { const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(body) }); csrfToken = data.csrfToken; return data.user; },
  async logout() { const data = await request('/auth/logout', { method: 'POST' }); csrfToken = data.csrfToken; },
  invitation: token => request(`/invitations/${token}`),
  async acceptInvitation(token, password) { const data = await request(`/invitations/${token}/accept`, { method: 'POST', body: JSON.stringify({ password }) }); csrfToken = data.csrfToken; return data.user; },
  month: (month = '2026-08') => request(`/months/${month}`),
  day: date => request(`/days/${date}`),
  updateBudget: body => request('/budget', { method: 'PATCH', body: JSON.stringify(body) }),
  admin: () => request('/admin/users'),
  invite: body => request('/admin/invitations', { method: 'POST', body: JSON.stringify(body) }),
  revokeInvitation: id => request(`/admin/invitations/${id}`, { method: 'DELETE' }),
  setUserActive: (id, isActive) => request(`/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ isActive }) }),
  addExpense: (date, body) => request(`/days/${date}/expenses`, { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID().replaceAll('-', '') }, body: JSON.stringify(body) }),
  updateExpense: (id, body) => request(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteExpense: id => request(`/expenses/${id}`, { method: 'DELETE' }),
};
