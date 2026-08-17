#!/usr/bin/env node

import { existsSync } from 'node:fs';
import { createConnection } from 'node:net';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const storage = join(root, 'backend', 'storage');
const windows = process.platform === 'win32';
const previewMode = process.argv.includes('--preview');
let phpProcess;
let viteServer;
let stopping = false;
process.chdir(root);

function command(name, override) {
  if (override) return override;
  const found = spawnSync(windows ? 'where.exe' : 'which', [name], { encoding: 'utf8' });
  return found.stdout?.split(/\r?\n/).find(Boolean) || name;
}

function portOpen(port) {
  return new Promise(done => {
    const socket = createConnection({ host: '127.0.0.1', port });
    const finish = value => { socket.destroy(); done(value); };
    socket.setTimeout(500);
    socket.once('connect', () => finish(true));
    socket.once('timeout', () => finish(false));
    socket.once('error', () => finish(false));
  });
}

async function waitFor(check, name) {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    if (await check()) return;
    await new Promise(done => setTimeout(done, 250));
  }
  throw new Error(`${name} did not start within 20 seconds.`);
}

async function apiHealthy() {
  try {
    const response = await fetch('http://127.0.0.1:8080/api/health', { signal: AbortSignal.timeout(1500) });
    const payload = await response.json();
    return response.ok && payload?.data?.status === 'healthy';
  } catch { return false; }
}

function startMySql() {
  const data = join(storage, 'mysql-data');
  if (!existsSync(join(data, 'mysql'))) throw new Error('Local MySQL data is missing. See README.md.');
  const base = process.env.MYSQL_BASEDIR || (windows ? 'C:\\Program Files\\MySQL\\MySQL Server 8.4' : '/usr');
  const executable = command('mysqld', process.env.MYSQLD_PATH || (windows ? join(base, 'bin', 'mysqld.exe') : undefined));
  const child = spawn(executable, [
    '--no-defaults', `--basedir=${base}`, `--datadir=${data}`, '--port=3307',
    '--bind-address=127.0.0.1', '--mysqlx=0', `--log-error=${join(storage, 'mysql-preview.log')}`,
  ], { detached: windows, stdio: 'ignore', windowsHide: true });
  child.unref();
  console.log('Starting preview database...');
}

function startPhp() {
  const executable = command('php', process.env.PHP_PATH);
  const installed = (spawnSync(executable, ['-m'], { encoding: 'utf8' }).stdout || '').toLowerCase();
  const missing = ['pdo_mysql', 'mbstring'].filter(name => !installed.includes(name));
  const args = [];
  if (missing.length) {
    args.push('-d', `extension_dir=${process.env.PHP_EXTENSION_DIR || join(dirname(executable), 'ext')}`);
    for (const name of missing) args.push('-d', `extension=${name}`);
  }
  args.push('-d', `session.save_path=${storage}`, '-d', `error_log=${join(storage, 'php-preview-error.log')}`,
    '-d', 'display_errors=Off', '-d', 'log_errors=On', '-S', '127.0.0.1:8080', join(root, 'backend', 'router.php'));
  console.log('Starting preview API...');
  return spawn(executable, args, { cwd: root, stdio: 'inherit', windowsHide: true });
}

async function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (viteServer) await viteServer.close();
  phpProcess?.kill();
  process.exit(code);
}

try {
  if (!(await portOpen(3307))) { startMySql(); await waitFor(() => portOpen(3307), 'MySQL'); }
  if (!(await apiHealthy())) {
    if (await portOpen(8080)) throw new Error('Port 8080 is occupied by another service.');
    phpProcess = startPhp();
    await waitFor(apiHealthy, 'PHP API');
  }
  console.log('API ready. Starting mobile preview...');
  const vite = await import('vite');
  viteServer = previewMode ? await vite.preview({ root }) : await vite.createServer({ root });
  if (!previewMode) await viteServer.listen();
  viteServer.printUrls();
  viteServer.bindCLIShortcuts?.({ print: true });
  process.once('SIGINT', () => void stop());
  process.once('SIGTERM', () => void stop());
} catch (error) {
  console.error(`Preview startup failed: ${error.message}`);
  await stop(1);
}
