import { test, expect } from '@playwright/test';
import { buildURL, siteConfig, requireEntries } from '../config-helper.js';
import { captureEvidence } from '../utils.js';

// The skeleton's error handling: an address that isn't a page gets a real
// not-found page, and a malformed address never causes a server error. They
// read siteConfig (config-helper.js).

test.describe('Error Handling Tests', { tag: ['@regression', '@errors'] }, () => {

  test('TC_ERROR_001 An unknown address shows a not-found page', {
    annotation: [{ type: 'test_case', description: 'TC_ERROR_001' }],
  }, async ({ page }, testInfo) => {
    const response = await page.goto(buildURL(testInfo, siteConfig.notFoundPath), { waitUntil: 'domcontentloaded' });
    expect.soft(response?.status(), `${siteConfig.notFoundPath} answers 404`).toBe(404);
    await expect(
      page.getByText(new RegExp(siteConfig.notFoundText, 'i')).first(),
      `the not-found page says "${siteConfig.notFoundText}"`,
    ).toBeVisible();
    await captureEvidence(page, testInfo);
  });

  test('TC_ERROR_002 A malformed address never causes a server error', {
    annotation: [{ type: 'test_case', description: 'TC_ERROR_002' }],
  }, async ({ page }, testInfo) => {
    for (const path of requireEntries('malformedPaths', siteConfig.malformedPaths)) {
      const res = await page.request.get(buildURL(testInfo, path), { failOnStatusCode: false });
      expect.soft(res.status(), `${path} answers below 500`).toBeLessThan(500);
    }
  });
});
