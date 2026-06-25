import { defineConfig, devices } from '@playwright/test'

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
    // CI : le proxy du runner casse 127.0.0.1 → connexion directe.
    launchOptions: { args: ['--no-proxy-server'] },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30000,
    actionTimeout: 30000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Serveurs séparés (pas via concurrently) : Playwright attend les 2 ports.
  webServer: [
    {
      command: 'pnpm run server',
      port: 4000,
      reuseExistingServer: !process.env.CI,
      timeout: 60000,
    },
    {
      // Build de prod (pas `next dev`) : le runtime HMR de Turbopack casse
      // l'hydratation en headless → l'app ne se connecte jamais. La prod n'a pas de HMR.
      command: 'pnpm build && pnpm start',
      url: 'http://127.0.0.1:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 180000,
    },
  ],
})
