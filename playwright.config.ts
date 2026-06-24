import { defineConfig, devices } from '@playwright/test'

/**
 * Config Playwright — smoke E2E chromium uniquement.
 * Voir https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: !process.env.CI,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:3000',
    // En CI, le runner a un proxy que chromium applique même au localhost
    // -> net::ERR_NAME_NOT_RESOLVED sur 127.0.0.1. On force une connexion directe.
    launchOptions: { args: ['--no-proxy-server'] },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 30000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // `pnpm dev` lance Next + le serveur WS (concurrently) : le smoke E2E est autonome.
  webServer: {
    command: 'pnpm dev',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
