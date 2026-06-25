import { test, expect } from '@playwright/test'

// Smoke E2E : serveur WS → client → cards live.

test('le dashboard se connecte et les cards se mettent à jour en live', async ({
  page,
}) => {
  // Re-navigue jusqu'à "Live" si le serveur WS n'est pas prêt au boot.
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

test('la route heatmap rend un canvas dimensionné', async ({ page }) => {
  await expect(async () => {
    await page.goto('/fleet/heatmap')
    await expect(page.getByText('Live', { exact: true })).toBeVisible({
      timeout: 4000,
    })
  }).toPass({ timeout: 30000 })

  const canvas = page.locator('main canvas')
  await expect(canvas).toBeVisible()
  const box = await canvas.boundingBox()
  expect(box?.width ?? 0).toBeGreaterThan(0)
  expect(box?.height ?? 0).toBeGreaterThan(0)
})

test('la landing pointe vers le dashboard', async ({ page }) => {
  await page.goto('/')
  await expect(
    page.getByRole('heading', { name: 'fleetscope' }),
  ).toBeVisible()
  await page.getByRole('link', { name: /dashboard/i }).click()
  await expect(page).toHaveURL(/\/fleet$/)
})
