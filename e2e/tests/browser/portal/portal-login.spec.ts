import { test, expect } from '@playwright/test';

test.describe('Portal Login', () => {
  test('login page shows sign in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form')).toBeVisible({ timeout: 30000 });
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  // TODO: client-side router.push timing issue in headless Playwright
  test.skip('valid credentials redirect to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@zuroy.com');
    await page.locator('input[type="password"]').fill('AdminPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Wait for navigation away from login (client-side router.push)
    await expect(page).not.toHaveURL(/login/, { timeout: 15000 });
  });

  test('wrong password shows error alert', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@zuroy.com');
    await page.locator('input[type="password"]').fill('wrongpassword1');
    await page.getByRole('button', { name: /sign in/i }).click();
    // Use .first() since Next.js route announcer also has role="alert"
    await expect(page.locator('.MuiAlert-root').first()).toBeVisible({ timeout: 10000 });
  });

  test('empty form does not submit', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/login/);
  });
});
