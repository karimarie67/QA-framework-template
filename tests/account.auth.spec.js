import { test, expect } from '@playwright/test';
import { buildURL, authConfig, authSkipReason } from '../config-helper.js';

// A logged-in spec: its name ends .auth.spec.js, so only the logged-in
// projects run it (*-auth, *-auth-mobile), starting from the session
// tests/auth.setup.js saved. Every other spec runs logged out.
//
// No screenshots or evidence captures: a logged-in page can show the
// account's data. The evidence is the run's JSON and log.

test.describe('Logged-in pages', { tag: ['@regression', '@auth'] }, () => {
  // Skips for the same reasons the login does (no login configured, or a PR
  // without the secrets), so it never runs on the empty session.
  const skipReason = authSkipReason();
  test.skip(skipReason !== null, skipReason ?? '');

  test('TC_AUTH_002 A page that needs a login opens with the saved session', {
    annotation: [{ type: 'test_case', description: 'TC_AUTH_002' }],
  }, async ({ page }, testInfo) => {
    const auth = authConfig();
    const response = await page.goto(buildURL(testInfo, auth.protectedPath), { waitUntil: 'load' });
    expect(response.status(), `${auth.protectedPath} answers below 400`).toBeLessThan(400);
    expect(new URL(page.url()).pathname, `${auth.protectedPath} isn't sent to the login page`).toBe(auth.protectedPath);
    await expect(page.getByText(auth.protectedText).first(), `${auth.protectedPath} shows "${auth.protectedText}"`).toBeVisible();
  });

  test.describe('without a session', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('TC_AUTH_003 Without a session, that page sends you to the login page', {
      annotation: [{ type: 'test_case', description: 'TC_AUTH_003' }],
    }, async ({ page }, testInfo) => {
      const auth = authConfig();
      const response = await page.goto(buildURL(testInfo, auth.protectedPath), { waitUntil: 'load' });
      if ([401, 403].includes(response.status())) return;
      expect(new URL(page.url()).pathname, `${auth.protectedPath}, logged out, ends on the login page`).toBe(auth.loginPath);
    });
  });
});
