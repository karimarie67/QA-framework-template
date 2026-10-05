import fs from 'fs';
import path from 'path';
import { test as setup, expect } from '@playwright/test';
import { buildURL, authConfig, authSkipReason, authStatePath, missingCredentials } from '../config-helper.js';

// The login, once per environment per run: the staging-setup and
// production-setup projects run this, and the logged-in projects
// (*.auth.spec.js) start from the session it saves. The account is
// QA_USERNAME and QA_PASSWORD from the environment (repo secrets in CI).
//
// The repo is public, so the password must never reach the report, a log, or
// a CI artifact:
// - it's entered with evaluate, not fill: a fill step's title holds the value
//   it typed, in the HTML report, even on a passing run;
// - the setup projects record no trace, screenshot, or video
//   (playwright.config.js); a trace would hold it;
// - on any failure the field is cleared before the error is rethrown, so the
//   failure's page snapshot can't show it; each step has a short timeout so a
//   stuck login fails here, not at the test's timeout;
// - this project never retries, so a wrong password is tried once and a real
//   account isn't locked out. Never pass --retries to a run that includes it.
//
// A site with SSO or MFA: replace the login steps below; keep the rules above.

/** Sets an input's value the way typing does, without a step title holding it. */
async function enterValue(field, value, timeout) {
  await field.evaluate((el, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, value, { timeout });
}

function saveEmptySession(file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ cookies: [], origins: [] }));
}

// Tagged for the tag check and the coverage map only: the login runs as the
// -auth projects' dependency whatever --grep selects.
setup('TC_AUTH_001 Logs in and saves the session', {
  tag: ['@regression', '@auth'],
  annotation: [{ type: 'test_case', description: 'TC_AUTH_001' }],
}, async ({ page }, testInfo) => {
  const file = authStatePath(testInfo.project.name.replace(/-setup$/, ''));

  // 1. No login configured, or a PR GitHub gives no secrets: an empty session,
  //    so the logged-in projects still start (their specs skip too).
  const skipReason = authSkipReason();
  if (skipReason) {
    saveEmptySession(file);
    setup.skip(true, skipReason);
    return;
  }

  // 2. Credentials missing anywhere else: fail, naming them (never a value).
  const missing = missingCredentials();
  if (missing.length) {
    throw new Error(`Not set: ${missing.join(', ')}. Set them in the environment (repo secrets in CI): see .claude/skills/new-engagement/site-config.md`);
  }

  // 3. Log in.
  const auth = authConfig();
  await page.goto(buildURL(testInfo, auth.loginPath), { waitUntil: 'load' });
  await page.getByLabel(auth.usernameLabel, { exact: true }).fill(process.env.QA_USERNAME, { timeout: 10000 });
  const secretField = page.getByLabel(auth.passwordLabel, { exact: true });
  try {
    await enterValue(secretField, process.env.QA_PASSWORD, 10000);
    await page.getByRole('button', { name: auth.submitName, exact: true }).click({ timeout: 10000 });
    await expect.poll(() => new URL(page.url()).pathname, {
      message: `the login page (${auth.loginPath}) is left after logging in`,
      timeout: 15000,
    }).not.toBe(auth.loginPath);
    await expect(page.getByText(auth.successText).first(), `"${auth.successText}" shows after logging in`).toBeVisible({ timeout: 15000 });
  } catch (err) {
    // Clear the field before Playwright snapshots the page for the failure.
    await enterValue(secretField, '', 2000).catch(() => {});
    throw err;
  }

  await page.context().storageState({ path: file });
});
