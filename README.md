# Daily DH

Daily DH is Adam's private, one-page expense ledger for August 2026. It records any number of custom expenses per day, performs every money calculation in integer centimes, enforces server-time edit windows, and presents the month as a responsive poster-inspired financial dashboard.

## Features

- All 31 days of August 2026, with support for any future `YYYY-MM` month through the API
- Custom expense names and multiple expenses per day; no fixed categories
- Automatic daily totals, saved/on-target/over-target states, and full monthly statistics
- Empty days remain "No expenses recorded" and are never silently counted as zero-spend days
- Today editable; yesterday editable only before 09:00; older and future days locked using the backend's Europe/Amsterdam clock
- Responsive ledger, accessible slide-over details, keyboard focus, visible labels, reduced-motion mode, and non-color status cues
- CSRF protection, ownership-scoped queries, CORS allow-list, strict JSON validation, request limiting, idempotent creates, and security headers

## Technology choices

The client uses React 19, Vite, Framer Motion, Lucide icons, and custom CSS. A Three.js runtime was intentionally avoided: a lightweight CSS/Framer depth effect achieves the reference's atmosphere without a large download or low-end-device penalty. The API uses PHP 8.2, PDO native prepared statements, and MySQL 8. Money is stored as integer centimes (`40 DH = 4000`) so no floating-point value reaches the database.

## Visual direction

`DESIGN.md` was treated as the principal reference. Its ember-rust canvas, tiger-gold accent, very large condensed type, dark nested surfaces, pill controls, dotted rules, flat depth, and poster rhythm became a financial "ledger poster." Required green and red budget states are used sparingly and always reinforced by an icon and explicit text.

## Structure

```text
src/
  components/       overview, ledger, statuses, day drawer/form
  hooks/            data loading state
  services/         credentialed REST client and CSRF handling
  utils/            centime formatting and client validation
backend/
  public/            API entry point and routing
  src/Config/        environment loading
  src/Database/      PDO connection
  src/Http/          safe request/response helpers
  src/Repositories/  ownership-scoped prepared queries
  src/Security/      CSRF utilities
  src/Services/      date permissions and financial calculations
  src/Validation/    strict allow-list input validation
  database/          normalized MySQL schema and initial Adam/budget data
  tests/             controllable-clock and validation tests
```

Expenses store `user_id` directly because an expense day has no independent attributes in this version; avoiding an empty join table keeps reads and authorization simpler. Effective-dated budgets support future changes without rewriting historical data. The temporary single-user boundary is the server-side `SINGLE_USER_ID`; the client never supplies ownership. Replace that value with an authenticated session user ID when accounts are introduced.

## Local setup

Requirements: Node.js 20+, PHP 8.2+ with PDO MySQL and mbstring, Composer 2, and MySQL 8+.

1. Copy `.env.example` to `.env`, and `backend/.env.example` to `backend/.env`.
2. Create a least-privilege MySQL application user, update `backend/.env`, and import `backend/database/schema.sql`. The schema seeds Adam and a 40 DH effective-dated daily budget.
3. Run `npm install` in the project root.
4. Run `composer install` in `backend`.
5. Start the API with `php -S localhost:8080 backend/router.php` from the project root.
6. In another terminal run `npm run dev`, then open the printed local URL.

The Vite development proxy forwards `/api` to PHP. For production, serve the built static files and `/api` on the expected origin, or set `VITE_API_BASE_URL` before building. Set `APP_ENV=production`, use HTTPS, a strong database password, and the exact public `APP_ORIGIN`.

## Build and tests

```text
npm run build
npm test
cd backend
composer test
```

Tests cover saved/on/over calculations, multiple expenses, empty-day semantics, invalid and hostile-looking input, integer money conversion, mass-assignment rejection, today/yesterday/older/future edit rules, and the 09:00 boundary. Ownership, CSRF, IDOR, monthly aggregation, and database integration should additionally run against an isolated MySQL test database in CI before public deployment.

## REST API

All responses use `{ "ok": true, "data": ... }` or `{ "ok": false, "error": { "message": ..., "fields": ... } }`.

- `GET /api/bootstrap` — CSRF token and server timezone
- `GET /api/months/{YYYY-MM}` — all dates and server-calculated monthly statistics
- `GET /api/days/{YYYY-MM-DD}` — one day and its owned expenses
- `POST /api/days/{YYYY-MM-DD}/expenses` — add an expense
- `PATCH /api/expenses/{id}` — update an owned, editable expense
- `DELETE /api/expenses/{id}` — delete an owned, editable expense

State-changing requests require JSON, a valid session CSRF header, and ownership/date authorization. The budget lookup is included in monthly and daily responses; a budget update endpoint is intentionally excluded from this first version to minimize privileged mutation surface.

## Security notes

All value-bearing SQL uses prepared statements with native emulation disabled. Mutation payloads use an explicit field allow-list; amounts, lengths, precision, date formats, ownership, and lock state are checked server-side. React renders descriptions as text and never uses unsafe HTML injection. Sessions are HttpOnly, SameSite Strict, and Secure in production. The API restricts CORS, hides production exceptions, logs details server-side, validates MIME type and JSON depth/size, rate-limits sessions, uses create idempotency keys, and sets CSP/frame, MIME, referrer, permissions, resource, and cache headers. Secrets are ignored by Git.

For a real multi-user release, add login with `password_hash()`/`password_verify()`, regenerate the session ID after authentication, rotate CSRF tokens, add a persistent IP+account-aware rate limiter, and configure CSP/security headers on the frontend host as well.

## Known limitations and future improvements

- The first UI is intentionally fixed to August 2026; the API and schema are month-generic.
- Authentication is not exposed yet; server-side single-user resolution is isolated for replacement.
- Session rate limiting is suitable for this private version, not a distributed deployment.
- Add database-backed integration tests, budget history editing, export, and authenticated accounts next.
