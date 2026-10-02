import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildURL, siteConfig, requireEntries } from '../config-helper.js';
import { captureEvidence } from '../utils.js';

// The skeleton's accessibility scan: axe-core on every page in siteConfig,
// against WCAG 2.1 A and AA. It fails on serious and critical violations, and
// lists moderate and minor ones without failing. siteConfig.a11y.exclude
// skips third-party embeds the client doesn't control.

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];
const BLOCKING = ['serious', 'critical'];

test.describe('Accessibility Tests', () => {

  test('TC_A11Y_001 No page has a serious or critical accessibility violation', {
    annotation: [{ type: 'test_case', description: 'TC_A11Y_001' }],
  }, async ({ page }, testInfo) => {
    const blocking = [];
    for (const p of requireEntries('pages', siteConfig.pages)) {
      let response;
      try {
        response = await page.goto(buildURL(testInfo, p.path), { waitUntil: 'load' });
      } catch (err) {
        expect.soft(err.message, `${p.path} failed to load, so it can't be scanned`).toBe('');
        continue;
      }
      // A page that doesn't load would scan clean: it must fail, not pass.
      const status = response?.status() ?? 0;
      if (status >= 400) {
        expect.soft(status, `${p.path} must load to be scanned`).toBeLessThan(400);
        continue;
      }

      let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
      for (const selector of siteConfig.a11y?.exclude ?? []) builder = builder.exclude(selector);
      const results = await builder.analyze();

      // Rule, impact, help, and where: not the nodes' HTML, so page content
      // (names, emails in markup) stays out of reports and evidence.
      const summary = results.violations.map(v => ({
        rule: v.id,
        impact: v.impact,
        help: v.helpUrl,
        targets: v.nodes.map(n => n.target),
      }));
      await testInfo.attach(`axe ${p.path}`, { body: JSON.stringify(summary, null, 2), contentType: 'application/json' });
      for (const v of results.violations) {
        console.log(`${p.path}: ${v.impact} ${v.id} (${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'}), first: ${JSON.stringify(v.nodes[0]?.target)}`);
        if (BLOCKING.includes(v.impact)) blocking.push(`${p.path}: ${v.impact} ${v.id} (${v.nodes.length})`);
      }
    }
    await captureEvidence(page, testInfo);
    expect(blocking, 'serious or critical accessibility violations').toEqual([]);
  });
});
