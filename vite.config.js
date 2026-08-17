import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = 'http://127.0.0.1:8080';
const headers = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' ws:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
};

function apiProxy() {
  return {
    target: apiTarget,
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', proxyRequest => {
        // A phone uses the computer's LAN address as its Origin. The API only
        // trusts its configured local origin, so normalize it inside the
        // same-origin development proxy instead of weakening production CORS.
        proxyRequest.setHeader('Origin', apiTarget);
      });
      proxy.on('error', (_error, _request, response) => {
        if (!response || response.headersSent || typeof response.writeHead !== 'function') return;
        response.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8' });
        response.end(JSON.stringify({
          ok: false,
          error: { message: 'The preview API is unavailable. Restart npm run dev.' },
        }));
      });
    },
  };
}

export default defineConfig({
  plugins: [react()],
  server: { host: '0.0.0.0', port: 5173, headers, proxy: { '/api': apiProxy() } },
  preview: { host: '0.0.0.0', port: 4173, headers, proxy: { '/api': apiProxy() } },
  build: { sourcemap: false },
  test: { environment: 'jsdom', setupFiles: './src/test/setup.js' },
});
