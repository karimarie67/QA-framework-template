import { test, expect } from '@playwright/test';
import { buildURL, siteConfig, requireEntries } from '../config-helper.js';
import { captureEvidence } from '../utils.js';

// The skeleton's forms test. READ-ONLY: it finds each form and its fields and
// reads their attributes, and never types, clicks, or submits, so it's safe on
// a live site. It imports nothing that interacts (test-helpers.js clicks), and
// fails if any request other than GET or HEAD goes to the site's own origin
// while it runs. Requests to other origins (analytics, consent beacons) are
// the page's own traffic: logged, not failed.
//
// A site with no forms: remove this spec, and drop it from the
// functional-tests CI job, `test:regression`, and scripts/test-skeleton.js.

test.describe('Forms Tests', () => {

  test('TC_FORM_001 Every form field has its label, type, and required state', {
    annotation: [{ type: 'test_case', description: 'TC_FORM_001' }],
  }, async ({ page }, testInfo) => {
    const forms = requireEntries('forms', siteConfig.forms);
    const origin = new URL(buildURL(testInfo, '/')).origin;
    const ownWrites = [];
    const otherWrites = [];
    page.on('request', req => {
      if (['GET', 'HEAD'].includes(req.method())) return;
      const entry = `${req.method()} ${req.url()}`;
      if (new URL(req.url()).origin === origin) ownWrites.push(entry);
      else otherWrites.push(entry);
    });

    for (const f of forms) {
      await page.goto(buildURL(testInfo, f.path), { waitUntil: 'load' });
      // eslint-disable-next-line playwright/no-networkidle -- waits for the page's own requests, so the test can fail on a write
      await page.waitForLoadState('networkidle');
      // By CSS selector, not by role: a <form> only has the form role when it
      // has an accessible name, which most real forms lack.
      const form = page.locator(f.selector || 'form').first();
      await expect.soft(form, `${f.path}: the form (${f.selector || 'form'}) is on the page`).toBeVisible();
      for (const field of requireEntries(`forms (${f.path}).fields`, f.fields)) {
        // Exact label, visible only: a hidden spam-trap field can share a label.
        const input = form.getByLabel(field.label, { exact: true }).filter({ visible: true });
        await expect.soft(input, `${f.path}: one visible field labelled "${field.label}"`).toHaveCount(1);
        if (field.type) {
          await expect.soft(input.first(), `${f.path}: "${field.label}" has type ${field.type}`).toHaveAttribute('type', field.type);
        }
        if (typeof field.required === 'boolean') {
          await expect.soft(input.first(), `${f.path}: "${field.label}" is ${field.required ? '' : 'not '}required`).toHaveJSProperty('required', field.required);
        }
      }
    }

    for (const entry of otherWrites) console.log(`Third-party request (not failed): ${entry}`);
    expect(ownWrites, `requests other than GET or HEAD to the site's own origin (${origin})`).toEqual([]);
    await captureEvidence(page, testInfo);
  });
});
