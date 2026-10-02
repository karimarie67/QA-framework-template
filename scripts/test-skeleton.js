#!/usr/bin/env node
/**
 * test-skeleton.js — `npm run test:skeleton`
 *
 * Runs the template's skeleton specs against its fixture site
 * (tests/fixtures/site/), so a change that breaks a spec is caught before an
 * Engagement meets it. CI runs it on every push and PR (skeleton-self-test).
 *
 * - Refuses to start if something already answers on the port, so it never
 *   tests the wrong server.
 * - Starts the fixture server, and waits up to 15 s for it to answer; fails
 *   at once if the server exits first.
 * - Runs Playwright with --retries=0 (CI would otherwise allow a retry and
 *   hide a flaky spec), with QA_BASE_URL set to the fixture and
 *   QA_SITE_CONFIG set to its site.json, unless QA_SITE_CONFIG is already set.
 * - With no arguments, runs the four skeleton specs on production and
 *   production-mobile. Spec paths given replace the default specs, and
 *   --project given replaces the default projects; other arguments (such as
 *   --reporter) pass through. BREAK=<id> passes through to the server.
 * - Stops the server on exit, failure, or Ctrl-C, and exits with Playwright's
 *   code; killed by a signal (no code) counts as a failure.
 *
 * Why not Playwright's own `webServer`: it would start the fixture for every
 * run of the main config, and an npm script that sets environment variables
 * isn't portable to Windows.
 */

import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.FIXTURE_PORT || 8765);
const BASE = `http://127.0.0.1:${PORT}`;
const WAIT_MS = 15000;

export const DEFAULT_SPECS = [
  'tests/smoke_tests.spec.js',
  'tests/error_handling_tests.spec.js',
  'tests/forms_tests.spec.js',
  'tests/accessibility_tests.spec.js',
];
export const DEFAULT_PROJECTS = ['production', 'production-mobile'];

/**
 * The Playwright arguments for a run: given specs replace the default specs,
 * given --project flags replace the default projects, anything else passes
 * through, and --retries=0 is always set.
 * @param {string[]} args
 */
export function playwrightArgs(args) {
  const specs = [];
  const projects = [];
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith('--project=')) projects.push(a.slice('--project='.length));
    else if (a === '--project' && i + 1 < args.length) projects.push(args[++i]);
    else if (a.startsWith('--retries')) { if (a === '--retries') i++; } // always 0
    else if (/\.spec\.js$/.test(a)) specs.push(a);
    else rest.push(a);
  }
  return [
    'test',
    ...(specs.length ? specs : DEFAULT_SPECS),
    ...(projects.length ? projects : DEFAULT_PROJECTS).map(p => `--project=${p}`),
    '--retries=0',
    ...rest,
  ];
}

/** The exit code to report for a child that ended with `code` or `signal`. */
export function exitCodeFor(code, signal) {
  // Playwright's own code; killed by a signal (code null) is a failure.
  return typeof code === 'number' ? code : 1;
}

function portAnswers(port) {
  return new Promise(resolve => {
    const socket = net.connect({ host: '127.0.0.1', port });
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
  });
}

async function waitForServer(server) {
  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    if (server.exitCode !== null || server.signalCode !== null) {
      throw new Error(`the fixture server exited before it answered (code ${server.exitCode}, signal ${server.signalCode})`);
    }
    try {
      const res = await fetch(`${BASE}/`);
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`the fixture server didn't answer on ${BASE} within ${WAIT_MS / 1000} s`);
}

async function main() {
  if (await portAnswers(PORT)) {
    console.error(`test-skeleton: something already answers on port ${PORT}; stop it, or set FIXTURE_PORT.`);
    process.exit(1);
  }

  const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const server = spawn(python, [path.join(repoRoot, 'tests/fixtures/site/server.py')], {
    cwd: repoRoot,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
  const stopServer = () => { if (server.exitCode === null && server.signalCode === null) server.kill(); };
  process.on('exit', stopServer);
  for (const sig of ['SIGINT', 'SIGTERM']) {
    process.on(sig, () => { stopServer(); process.exit(130); });
  }

  try {
    await waitForServer(server);
  } catch (err) {
    console.error(`test-skeleton: ${err.message}`);
    stopServer();
    process.exit(1);
  }

  const env = {
    ...process.env,
    QA_BASE_URL: BASE,
    QA_SITE_CONFIG: process.env.QA_SITE_CONFIG || path.join(repoRoot, 'tests/fixtures/site/site.json'),
  };
  const cli = path.join(repoRoot, 'node_modules/@playwright/test/cli.js');
  const run = spawn(process.execPath, [cli, ...playwrightArgs(process.argv.slice(2))], {
    cwd: repoRoot,
    env,
    stdio: 'inherit',
  });
  run.on('close', (code, signal) => {
    stopServer();
    process.exit(exitCodeFor(code, signal));
  });
}

// Run when invoked as a command, not when imported (the unit tests import it).
const self = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === self) {
  main().catch(err => {
    console.error(`test-skeleton: ${err.stack || err.message}`);
    process.exit(1);
  });
}
