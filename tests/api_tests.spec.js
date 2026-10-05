import { test, expect } from '@playwright/test';
import { buildURL, siteConfig, requireEntries } from '../config-helper.js';
import { politeGet, skipOnPhone } from '../test-helpers.js';

// The skeleton's API tests, from siteConfig.api. READ-ONLY: GET requests
// only, spaced out (politeGet), never sending data. Request-only, so they run
// once, on the desktop project. A site with no API to test: leave
// siteConfig.api null (they skip), or remove this spec and drop it from
// scripts/test-skeleton.js and template-check's spec list.
//
// No screenshots: there's no page. The evidence is the run's JSON and log.

const api = siteConfig.api ?? null;
const endpoints = () => requireEntries('api.endpoints', api.endpoints);

/** The response's JSON, or a failure naming the endpoint. */
async function jsonOf(response, path) {
  try {
    return await response.json();
  } catch {
    throw new Error(`${path}: the body isn't valid JSON`);
  }
}

test.describe('API Tests', { tag: ['@regression', '@api'] }, () => {
  test.skip(api === null, 'no API configured (siteConfig.api is not set)');

  test('TC_API_001 Every endpoint answers with its expected status and content type', {
    annotation: [{ type: 'test_case', description: 'TC_API_001' }],
  }, async ({ request }, testInfo) => {
    skipOnPhone(testInfo);
    for (const e of endpoints()) {
      const response = await politeGet(request, buildURL(testInfo, e.path));
      expect.soft(response.status(), `${e.path} answers ${e.status ?? 200}`).toBe(e.status ?? 200);
      if (e.contentType) {
        expect.soft(response.headers()['content-type'] ?? '', `${e.path} is ${e.contentType}`).toContain(e.contentType);
      }
    }
  });

  test('TC_API_002 Every JSON endpoint returns the fields it promises', {
    annotation: [{ type: 'test_case', description: 'TC_API_002' }],
  }, async ({ request }, testInfo) => {
    skipOnPhone(testInfo);
    const promising = endpoints().filter(e => e.jsonKeys || e.itemKeys);
    test.skip(promising.length === 0, 'no endpoint lists jsonKeys or itemKeys');
    for (const e of promising) {
      const response = await politeGet(request, buildURL(testInfo, e.path));
      const body = await jsonOf(response, e.path);
      if (e.jsonKeys) {
        for (const key of e.jsonKeys) {
          expect.soft(body, `${e.path} has the field "${key}"`).toHaveProperty(key);
        }
      }
      if (e.itemKeys) {
        expect(Array.isArray(body), `${e.path} is a list`).toBe(true);
        expect.soft(body.length, `${e.path} has at least ${e.minItems ?? 1} item(s)`).toBeGreaterThanOrEqual(e.minItems ?? 1);
        body.forEach((item, i) => {
          for (const key of e.itemKeys) {
            expect.soft(item, `${e.path} item ${i} has the field "${key}"`).toHaveProperty(key);
          }
        });
      }
    }
  });
});
