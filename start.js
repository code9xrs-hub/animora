import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('  ANIMORA ANIME STREAMING PLATFORM');
console.log('  AniList GraphQL v2 + Mirror-Box API + Fribb Crosswalk Index');
console.log('================================================================');

const isWindows = process.platform === 'win32';
const npxCmd = isWindows ? 'npx.cmd' : 'npx';

// 1. Start Server (Express BFF) with automatic hot-reload
const serverProc = spawn('node', ['--watch', 'server/src/index.js'], {
  cwd: __dirname,
  stdio: 'pipe',
  shell: true,
  env: { ...process.env, PORT: '5000' }
});

serverProc.stdout.on('data', (d) => {
  process.stdout.write(`\x1b[33m[SERVER]\x1b[0m ${d.toString()}`);
});
serverProc.stderr.on('data', (d) => {
  process.stderr.write(`\x1b[31m[SERVER ERROR]\x1b[0m ${d.toString()}`);
});

// 2. Start Client (Vite Dev Server)
const clientProc = spawn(npxCmd, ['vite', '--host', 'localhost', '--port', '3000'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'pipe',
  shell: true,
  env: { ...process.env }
});

clientProc.stdout.on('data', (d) => {
  process.stdout.write(`\x1b[36m[CLIENT]\x1b[0m ${d.toString()}`);
});
clientProc.stderr.on('data', (d) => {
  process.stderr.write(`\x1b[31m[CLIENT ERROR]\x1b[0m ${d.toString()}`);
});

function cleanup() {
  console.log('\nShutting down Animora Anime Platform processes...');
  try { serverProc.kill(); } catch {}
  try { clientProc.kill(); } catch {}
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
