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
  month: (month = '2026-08') => request(`/months/${month}`),
  day: (date) => request(`/days/${date}`),
  addExpense: (date, body) => request(`/days/${date}/expenses`, { method: 'POST', headers: { 'Idempotency-Key': crypto.randomUUID().replaceAll('-', '') }, body: JSON.stringify(body) }),
  updateExpense: (id, body) => request(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteExpense: (id) => request(`/expenses/${id}`, { method: 'DELETE' }),
};
