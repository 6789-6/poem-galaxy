import { expect, test } from '@playwright/test';

test('static fallback retains search and reading', async ({ page }) => {
  await page.goto('/poem-galaxy/?static=1');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: '跳过开场' }).click({ timeout: 1000 }).catch(() => undefined);
  await expect(page.getByTestId('static-galaxy')).toBeVisible();
  await page.getByRole('searchbox').fill('将进酒');
  await page.getByRole('option', { name: /將進酒/ }).first().click();
  await expect(page.getByRole('heading', { name: '將進酒' })).toBeVisible();
});

test('reduced motion skips the cinematic intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/poem-galaxy/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: '跳过开场' })).toHaveCount(0);
  await expect(page.getByRole('searchbox')).toBeVisible();
});
