# Mobile preview login checkpoint

Saved: 2026-08-16 (Africa/Casablanca)

## Completed

- Diagnosed the misleading login error: Vite was serving the frontend without a reachable PHP/MySQL API.
- Changed `npm run dev` and `npm run preview` to use `scripts/dev-preview.mjs`.
- Added `scripts/dev-preview.mjs`, which starts/checks the existing MySQL database and PHP API before starting Vite.
- Made Vite listen on `0.0.0.0` for mobile access.
- Added the API proxy to both dev and preview modes.
- Normalized the phone/LAN Origin inside the local proxy without weakening production CORS.
- Added a JSON 503 response when the preview API is unavailable.
- Confirmed the local database contains the activated admin account `adam@local.invalid` (password was not read or changed).

## Verification completed

- `node --check scripts/dev-preview.mjs` passed.
- All 27 Vitest tests passed.
- `npm run dev` started successfully.
- Mobile-origin request through `http://127.0.0.1:5173/api/bootstrap` returned HTTP 200 and valid JSON.
- At checkpoint time, ports 5173 (Vite), 8080 (PHP), and 3307 (MySQL) were listening.
- Current Wi-Fi preview URL: `http://192.168.1.94:5173/`.

## Remaining check

- `npm run build` reached the build but failed because the live-preview system locks `dist/.mobile-preview-user` and Vite could not empty `dist`. Do not delete that marker without confirming what owns it. The dev/mobile preview itself is working.
- Perform one manual sign-in from the mobile preview with the existing local account password and confirm the authenticated dashboard loads.

## Working tree

- Modified: `package.json`, `vite.config.js`
- Added: `scripts/dev-preview.mjs`, this checkpoint file
- Unrelated pre-existing untracked file: `debug.log` (leave untouched)
