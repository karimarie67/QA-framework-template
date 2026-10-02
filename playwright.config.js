const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
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
      use: {
        // TODO(Engagement): replace with your actual staging URL
        baseURL: 'https://staging.example.com',
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        trace: 'on-first-retry',
      },
    },
    {
      name: 'production',
      use: {
        // TODO(Engagement): replace with your actual production URL
        baseURL: 'https://www.example.com',
        browserName: 'chromium',
        headless: true,
        viewport: { width: 1280, height: 720 },
        trace: 'on-first-retry',
      },
    },
    {
      name: 'staging-mobile',
      use: {
        // A phone emulation, not a narrow desktop window: many sites send phones
        // a separate layout (for example a menu button instead of the header menu).
        ...devices['Pixel 5'],
        // TODO(Engagement): replace with your actual staging URL
        baseURL: 'https://staging.example.com',
        browserName: 'chromium',
        headless: true,
        trace: 'on-first-retry',
      },
    },
    {
      name: 'production-mobile',
      use: {
        // A phone emulation, not a narrow desktop window: many sites send phones
        // a separate layout (for example a menu button instead of the header menu).
        ...devices['Pixel 5'],
        // TODO(Engagement): replace with your actual production URL
        baseURL: 'https://www.example.com',
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