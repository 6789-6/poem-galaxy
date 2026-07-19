import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('loads the cinematic shell and completes a search flow', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/poem-galaxy/');
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: '诗云' })).toBeVisible();
  await page.getByRole('button', { name: '跳过开场' }).click({ timeout: 1000 }).catch(() => undefined);
  await page.getByRole('searchbox').fill('将进酒');
  await page.getByRole('option', { name: /將進酒/ }).first().click();
  await expect(page.getByRole('heading', { name: '將進酒' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: /李白/ })).toBeVisible();
  expect(errors).toEqual([]);
});

test('has no horizontal overflow and exposes six dynasties', async ({ page }) => {
  await page.goto('/poem-galaxy/?static=1');
  await page.waitForLoadState('networkidle');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByRole('checkbox')).toHaveCount(6);
  const serious = (await new AxeBuilder({ page }).analyze()).violations
    .filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(serious).toEqual([]);
});
