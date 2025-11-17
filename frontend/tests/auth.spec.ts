import { expect, test } from '@playwright/test';

test('redirects unauthenticated users away from protected dashboard', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
});

test('protects settings route behind auth and roles', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL(/\/login/);
});
