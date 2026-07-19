import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './output/playwright',
  workers: 2,
  use: {
    baseURL: liveBaseUrl ?? 'http://127.0.0.1:4187',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium', viewport: { width: 390, height: 844 } } }
  ],
  webServer: liveBaseUrl ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1 --port 4187',
    url: 'http://127.0.0.1:4187/poem-galaxy/',
    reuseExistingServer: false
  }
});
