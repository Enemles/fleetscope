import { test, expect } from '@playwright/test'

// Smoke Phase 1 : vérifie la chaîne complète serveur WS → client → cards live.
// (Phase 7 enrichira : route heatmap, déconnexion/reconnexion, etc.)

test('le dashboard se connecte et les cards se mettent à jour en live', async ({
  page,
}) => {
  // Le hook naïf (Phase 1) ne retente pas la connexion : si le serveur WS n'était
  // pas prêt au montage, on re-navigue jusqu'à "Live" (limite corrigée en Phase 2).
  await expect(async () => {
    await page.goto('/fleet')
    await expect(page.getByText('Live', { exact: true })).toBeVisible({
      timeout: 4000,
    })
  }).toPass({ timeout: 30000 })

  // Au moins une card GPU est rendue.
  await expect(page.getByText('gpu-0000', { exact: true })).toBeVisible()

  // Les valeurs affluent : le contenu de la grille diffère après ~1.5 s.
  const main = page.locator('main')
  const before = await main.innerText()
  await page.waitForTimeout(1500)
  const after = await main.innerText()
  expect(after).not.toEqual(before)
})

test('la landing pointe vers le dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'fleetscope' }),
  ).toBeVisible()
  await page.getByRole('link', { name: /dashboard/i }).click()
  await expect(page).toHaveURL(/\/fleet$/)
})
