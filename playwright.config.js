import { defineConfig, devices } from '@playwright/test';

// QA_BASE_URL points every staging and production project at one address, for
// testing the template against its fixture site (npm run test:skeleton) or a
// preview deploy. Namespaced, since many machines export BASE_URL for other
// projects; logged, so a run never silently tests another site.
const QA_BASE_URL = process.env.QA_BASE_URL;
if (QA_BASE_URL) console.log(`QA_BASE_URL in use: ${QA_BASE_URL}`);
const site = placeholder => QA_BASE_URL || placeholder;

// The link checker crawls the whole site: it runs only on its own project.
const notTheLinkChecker = /check-links\.spec\.js$/;

export default defineConfig({
  // Playwright empties its output directory at the start of every run. Keep it
  // away from `test-results/`, which holds committed proof of work
  // (docs/agents/testing.md): with the default, a run deleted that evidence.
  outputDir: 'playwright-output',
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }]
  ],
  projects: [
    {
      name: 'local',
      testIgnore: notTheLinkChecker,
      use: {
        baseURL: 'http://localhost:8000',
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        trace: 'on-first-retry',
      },
    },
    
    {
      name: 'staging',
      testIgnore: notTheLinkChecker,
      use: {
        // TODO(Engagement): replace with your actual staging URL
        baseURL: site('https://staging.example.com'),
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        trace: 'on-first-retry',
      },
    },
    {
      name: 'production',
      testIgnore: notTheLinkChecker,
      use: {
        // TODO(Engagement): replace with your actual production URL
        baseURL: site('https://www.example.com'),
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        trace: 'on-first-retry',
      },
    },
    {
      name: 'staging-mobile',
      testIgnore: notTheLinkChecker,
      use: {
        // A phone emulation, not a narrow desktop window: many sites send phones
        // a separate layout (for example a menu button instead of the header menu).
        ...devices['Pixel 5'],
        // TODO(Engagement): replace with your actual staging URL
        baseURL: site('https://staging.example.com'),
        browserName: 'chromium',
        headless: true,
        trace: 'on-first-retry',
      },
    },
    {
      name: 'production-mobile',
      testIgnore: notTheLinkChecker,
      use: {
        // A phone emulation, not a narrow desktop window: many sites send phones
        // a separate layout (for example a menu button instead of the header menu).
        ...devices['Pixel 5'],
        // TODO(Engagement): replace with your actual production URL
        baseURL: site('https://www.example.com'),
        browserName: 'chromium',
        headless: true,
        trace: 'on-first-retry',
      },
    },
    // Special project for link checking - no traces/screenshots to avoid thousands of files
    {
      name: 'link-checker',
      testMatch: /check-links\.spec\.js$/,
      use: {
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        screenshot: 'off',
        video: 'off',
        trace: 'off',
      },
      timeout: 1800000, // 30 minutes for link checking
      retries: 0, // Don't retry link checks
    },
  ],
  use: {
    // A screenshot of every failure. Evidence for a passing test is taken on
    // purpose, with utils.js's captureEvidence (docs/agents/testing.md).
    screenshot: 'only-on-failure',
    video: 'off',
  },
  testDir: './tests',
  testMatch: ['**/*.spec.js'],
  timeout: 90000,
  // Retry once in CI, where a one-off network blip shouldn't fail the run.
  // Never locally: a retry there hides a flaky test while you're writing it.
  retries: process.env.CI ? 1 : 0,
});