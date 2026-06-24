import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    // Pas encore de tests unitaires → ne casse pas la CI.
    passWithNoTests: true,
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/tests/**', // tests E2E Playwright
      '**/test-results/**',
      '**/*.spec.ts', // fichiers Playwright
    ],
    coverage: {
      provider: 'v8',
      // json-summary alimente le commentaire de couverture en CI (coverage-summary.json).
      reporter: ['text', 'json', 'json-summary', 'html'],
      // Couverture limitée à la logique pure testable.
      include: [
        'src/lib/services/**/*.ts', // parser, reconnect, ring-buffer
        'src/lib/store/**/*.ts', // store + selectors
        'src/lib/utils.ts',
      ],
      exclude: [
        'coverage/**',
        '**/node_modules/**',
        'src/test/**',
        '**/*.d.ts',
        'src/lib/types/**/*', // types only
        'src/lib/store/telemetry-context.tsx', // impl Context, non couverte
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
