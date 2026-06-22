import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : '75%',
  use: { baseURL: 'http://localhost:4321' },
  webServer: {
    command: 'npx serve . -l 4321 -s',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
});
