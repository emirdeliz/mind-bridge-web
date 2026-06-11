import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const loadEnvFile = (cwd, filename, override) => {
  const envPath = resolve(cwd, filename);
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (override || process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
};

/** Loads `.env` first, then `.env.local` (local overrides). */
export const loadEnvFiles = (cwd = process.cwd()) => {
  loadEnvFile(cwd, '.env', false);
  loadEnvFile(cwd, '.env.local', true);
};
