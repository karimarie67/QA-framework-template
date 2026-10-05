import { test, expect } from '@playwright/test';
import { buildURL, siteConfig, requireEntries } from '../config-helper.js';

// The skeleton's visual regression test, from siteConfig.visual: each page's
// screenshot compared with its committed baseline image.
//
// Screenshots differ by operating system and fonts, so this runs only inside
// Playwright's Docker image, where every machine renders alike:
//   npm run test:visual           compare with the baselines
//   npm run test:visual:update    make or refresh the baselines (then review
//                                 and commit them, like code)
// Anywhere else (a plain run, CI's jobs) it skips. The baselines live next to
// this spec, in visual_tests.spec.js-snapshots/, one per page and project.

const visual = siteConfig.visual ?? null;
const inDocker = process.env.QA_VISUAL === '1';

test.describe('Visual Tests', { tag: ['@regression', '@visual'] }, () => {
  test.skip(visual === null, 'no visual checks configured (siteConfig.visual is not set)');
  test.skip(!inDocker, "visual tests run in Playwright's Docker image only: npm run test:visual");

  test('TC_VISUAL_001 Every page looks like its baseline', {
    annotation: [{ type: 'test_case', description: 'TC_VISUAL_001' }],
  }, async ({ page }, testInfo) => {
    const paths = visual.pages || requireEntries('pages', siteConfig.pages).map(p => p.path);
    for (const path of paths) {
      await page.goto(buildURL(testInfo, path), { waitUntil: 'load' });
      // Fonts and late images settle before the shot.
      await page.evaluate(() => document.fonts.ready);
      const name = `${path === '/' ? 'home' : path.replace(/^\/|\/$/g, '').replace(/[^a-zA-Z0-9]+/g, '-')}.png`;
      await expect.soft(page, `${path} looks like its baseline`).toHaveScreenshot(name, {
        fullPage: true,
        animations: 'disabled',
        // Moving or personal parts of the page (a clock, a carousel, a name).
        mask: (visual.mask || []).map(selector => page.locator(selector)),
        maxDiffPixelRatio: visual.maxDiffPixelRatio ?? 0.01,
      });
    }
  });
});
