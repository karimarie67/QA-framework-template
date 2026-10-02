import fs from 'fs';
import { devices } from '@playwright/test';

/**
 * Get the base URL from the current project configuration
 * @param {import('@playwright/test').TestInfo} testInfo - Test info object
 * @returns {string} The base URL for the current project
 */
export function getBaseURL(testInfo) {
  const config = testInfo.project.use;
  // TODO(Engagement): replace this placeholder with the Engagement's actual base URL.
  return config.baseURL || 'https://www.example.com';
}

/**
 * Build a URL relative to the current project's base URL
 * @param {import('@playwright/test').TestInfo} testInfo - Test info object
 * @param {string} path - The path to append to base URL
 * @param {Object} options - URL options
 * @param {boolean} options.cachebust - Add cachebust parameter
 * @param {Object} options.params - Additional query parameters
 * @returns {string} Complete URL
 */
export function buildURL(testInfo, path = '/', options = {}) {
  const baseURL = getBaseURL(testInfo);
  const url = new URL(path, baseURL);

  if (options.cachebust) {
    url.searchParams.set('cachebust', Date.now().toString());
  }

  if (options.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  return url.toString();
}

/**
 * The site under test: what the skeleton specs check. Fill it in from a probe
 * of the site (.claude/skills/new-engagement/site-config.md). Every value
 * below is a placeholder.
 *
 * - pages: each page's path and title. A title in slashes ("/Shop|Store/i")
 *   is a pattern; anything else must match exactly.
 * - nav: the header menu's links, by accessible name, and where each goes.
 * - footer.links: the footer's links, by accessible name.
 * - notFoundPath / notFoundText: an address that isn't a page, and the text
 *   its not-found page shows.
 * - malformedPaths: addresses that must never cause a server error (5xx).
 * - forms: each form's page, a CSS selector for it (default "form"), and its
 *   fields by their exact label, with the input type and whether it's
 *   required. The forms spec only reads them; it never types or submits.
 * - a11y.exclude: CSS selectors the accessibility scan skips (third-party
 *   embeds the client doesn't control).
 */
export const defaultSiteConfig = {
  // TODO(Engagement): every page to check, from the probe.
  pages: [
    { path: '/', title: 'Example Domain' },
  ],
  // TODO(Engagement): the header menu's links.
  nav: [
    { name: 'Home', path: '/' },
  ],
  // TODO(Engagement): the footer's links.
  footer: { links: ['Privacy'] },
  // TODO(Engagement): an address that isn't a page, and what its 404 page says.
  notFoundPath: '/this-page-does-not-exist',
  notFoundText: 'not found',
  malformedPaths: ['/%ZZ', '/..%2f..%2f', '/<script>'],
  // TODO(Engagement): each form, and its fields by their exact label.
  forms: [
    {
      path: '/contact',
      selector: 'form',
      fields: [
        { label: 'Email', type: 'email', required: true },
      ],
    },
  ],
  a11y: { exclude: [] },
};

/**
 * The Site config the specs use: the JSON file named by QA_SITE_CONFIG when
 * it's set (for testing the template against its fixture site, or a site's
 * config kept outside the code), otherwise defaultSiteConfig.
 * @param {Record<string, string | undefined>} env
 */
export function loadSiteConfig(env = process.env) {
  const file = env.QA_SITE_CONFIG;
  if (!file) return defaultSiteConfig;
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (err) {
    throw new Error(`QA_SITE_CONFIG names a file that can't be read: ${file} (${err.code || err.message})`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`QA_SITE_CONFIG names a file that isn't valid JSON: ${file} (${err.message})`);
  }
}

export const siteConfig = loadSiteConfig();

/**
 * A page title from siteConfig as Playwright expects it: "/pattern/flags" is a
 * RegExp, anything else an exact string.
 * @param {string} title
 */
export function titleMatcher(title) {
  const m = /^\/(.+)\/([a-z]*)$/.exec(title);
  return m ? new RegExp(m[1], m[2]) : title;
}

/**
 * A siteConfig list that must not be empty: a test looping over an empty list
 * would pass while checking nothing.
 * @param {string} name - e.g. "pages", "footer.links"
 * @param {unknown[]} list
 */
export function requireEntries(name, list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error(`siteConfig.${name} is empty: configure it (see .claude/skills/new-engagement/site-config.md)`);
  }
  return list;
}

/**
 * Test data constants
 */
export const testData = {
  timeouts: {
    short: 5000,
    medium: 15000,
    long: 30000,
    download: 60000,
  },
  viewport: {
    desktop: { width: 1280, height: 720 },
    // The same phone the *-mobile projects emulate (playwright.config.js).
    mobile: devices['Pixel 5'].viewport,
  }
};
