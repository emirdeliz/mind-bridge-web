import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadEnvFiles } from './load-env.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

loadEnvFiles(root);

const nextBin = resolve(root, 'node_modules/next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev', '-p', '3001'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
