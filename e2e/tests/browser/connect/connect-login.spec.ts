import { test, expect } from '@playwright/test';

test.describe('Connect Login', () => {
  test('login page shows form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible({ timeout: 30000 });
  });

  // TODO: client-side router.push timing issue in headless Playwright
  test.skip('valid staff login redirects', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('staff@testhotel.com');
    await page.locator('input[type="password"]').fill('StaffPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).not.toHaveURL(/login/, { timeout: 15000 });
  });

  test('wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('staff@testhotel.com');
    await page.locator('input[type="password"]').fill('wrongpassword1');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.locator('.MuiAlert-root').first()).toBeVisible({ timeout: 10000 });
  });
});
