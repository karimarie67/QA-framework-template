import { test, expect } from '@playwright/test';
import { selectors } from '../selectors.js';
import { buildURL, siteConfig, titleMatcher, requireEntries } from '../config-helper.js';
import { handleMobileMenu } from '../test-helpers.js';
import { captureEvidence } from '../utils.js';

// The skeleton's smoke tests: every page loads, the header menu works (on a
// phone, through its menu button), and the footer is there. They read
// siteConfig (config-helper.js); fill it in from a probe of the site.

const s = selectors.site;

test.describe('Smoke Tests', { tag: '@smoke' }, () => {

  test('TC_SMOKE_001 Every page loads with its title and one main heading', {
    annotation: [{ type: 'test_case', description: 'TC_SMOKE_001' }],
  }, async ({ page }, testInfo) => {
    for (const p of requireEntries('pages', siteConfig.pages)) {
      let response;
      try {
        response = await page.goto(buildURL(testInfo, p.path), { waitUntil: 'domcontentloaded' });
      } catch (err) {
        // A page that fails to load is reported, and the rest still checked.
        expect.soft(err.message, `${p.path} failed to load`).toBe('');
        continue;
      }
      expect.soft(response?.status() ?? 0, `${p.path} answers below 400`).toBeLessThan(400);
      await expect.soft(page, `${p.path} has its title`).toHaveTitle(titleMatcher(p.title));
      await expect.soft(s.mainHeading(page), `${p.path} has exactly one h1`).toHaveCount(1);
    }
    await captureEvidence(page, testInfo);
  });

  test('TC_SMOKE_002 The header menu links reach their pages', {
    annotation: [{ type: 'test_case', description: 'TC_SMOKE_002' }],
  }, async ({ page }, testInfo) => {
    const start = buildURL(testInfo, requireEntries('pages', siteConfig.pages)[0].path);
    for (const item of requireEntries('nav', siteConfig.nav)) {
      await page.goto(start, { waitUntil: 'domcontentloaded' });
      // On a phone the menu is behind its button; on a desktop this does nothing.
      await handleMobileMenu(page, selectors, 'TC_SMOKE_002');
      const link = s.navLink(page, item.name);
      await expect.soft(link, `the menu has a "${item.name}" link`).toBeVisible();
      const href = await link.getAttribute('href').catch(() => null);
      if (!href) continue;
      const target = new URL(href, page.url());
      expect.soft(target.pathname, `the "${item.name}" link goes to ${item.path}`).toBe(item.path);
      const res = await page.request.get(target.href);
      expect.soft(res.status(), `the "${item.name}" link's page answers below 400`).toBeLessThan(400);
    }
    await captureEvidence(page, testInfo);
  });

  test('TC_SMOKE_003 The footer is there, with its links', {
    annotation: [{ type: 'test_case', description: 'TC_SMOKE_003' }],
  }, async ({ page }, testInfo) => {
    const links = requireEntries('footer.links', siteConfig.footer?.links);
    await page.goto(buildURL(testInfo, requireEntries('pages', siteConfig.pages)[0].path), { waitUntil: 'domcontentloaded' });
    await expect(s.footer(page), 'the page has a footer (a contentinfo landmark)').toBeVisible();
    for (const name of links) {
      await expect.soft(s.footerLink(page, name), `the footer has a "${name}" link`).toBeVisible();
    }
    await captureEvidence(page, testInfo);
  });
});
