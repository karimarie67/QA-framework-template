#!/usr/bin/env node
/**
 * visual.js: `npm run test:visual` and `npm run test:visual:update`
 *
 * Runs the visual tests (@visual) inside Playwright's own Docker image, the
 * version matching the installed @playwright/test, so screenshots render the
 * same on every machine: a Mac, Linux, or CI. Needs Docker running.
 *
 * - `--update` makes or refreshes the baselines (--update-snapshots).
 * - Other arguments pass through to Playwright (default projects:
 *   staging and staging-mobile).
 * - QA_BASE_URL and QA_SITE_CONFIG pass through. A URL on this machine
 *   (localhost, 127.0.0.1) is rewritten to host.docker.internal, so the
 *   container can reach it.
 * - The repo is mounted at /work; node_modules is the host's (Playwright and
 *   its test runner are plain JavaScript).
 */

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** The Docker image for an installed @playwright/test version. */
export function imageFor(version) {
  return `mcr.microsoft.com/playwright:v${version}-noble`;
}

/** A URL the container can reach: this machine's localhost is the host. */
export function forContainer(url) {
  return url ? url.replace(/^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/, '$1host.docker.internal') : url;
}

/**
 * The `docker run` arguments for a visual run.
 * @param {{version: string, args: string[], env: Record<string, string|undefined>, root: string}} o
 */
export function dockerArgs({ version, args, env, root }) {
  const update = args.includes('--update');
  const rest = args.filter(a => a !== '--update');
  const projects = rest.some(a => a.startsWith('--project')) ? [] : ['--project=staging', '--project=staging-mobile'];
  const pass = { QA_VISUAL: '1', CI: env.CI, QA_BASE_URL: forContainer(env.QA_BASE_URL) };
  if (env.QA_SITE_CONFIG) pass.QA_SITE_CONFIG = path.isAbsolute(env.QA_SITE_CONFIG) ? env.QA_SITE_CONFIG : path.posix.join('/work', env.QA_SITE_CONFIG);
  const envFlags = Object.entries(pass).filter(([, v]) => v).flatMap(([k, v]) => ['-e', `${k}=${v}`]);
  return [
    'run', '--rm', '--ipc=host', '--add-host=host.docker.internal:host-gateway',
    '-v', `${root}:/work`, '-w', '/work', ...envFlags, imageFor(version),
    'npx', 'playwright', 'test', '--grep', '@visual', ...projects,
    ...(update ? ['--update-snapshots'] : []), ...rest,
  ];
}

function main() {
  const version = JSON.parse(fs.readFileSync(path.join(repoRoot, 'node_modules/@playwright/test/package.json'), 'utf8')).version;
  const info = spawnSync('docker', ['info'], { stdio: 'ignore' });
  if (info.status !== 0) {
    console.error('visual: Docker is not running (or not installed). Start Docker Desktop, then run this again.');
    process.exit(1);
  }
  const run = spawnSync('docker', dockerArgs({ version, args: process.argv.slice(2), env: process.env, root: repoRoot }), { stdio: 'inherit' });
  process.exit(typeof run.status === 'number' ? run.status : 1);
}

// Run when invoked as a command, not when imported (the unit tests import it).
const self = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === self) main();
