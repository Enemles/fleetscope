import { defineConfig } from 'vitest/config'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    // Pas de test au démarrage du projet : on ne casse pas la CI tant que la
    // Phase 7 n'a pas écrit les tests unitaires.
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
      // On ne mesure QUE la logique pure et testable (cf. plan Phase 7).
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
        'src/lib/store/telemetry-context.tsx', // impl Context "avant" (Phase 1), non testée exprès
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
