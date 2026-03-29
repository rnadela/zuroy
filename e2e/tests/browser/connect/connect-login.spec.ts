import { test, expect } from '@playwright/test';

test.describe('Connect Login', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15000 });
  });

  test('login with staff credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('staff@testhotel.com');
    await page.getByLabel('Password').fill('StaffPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/dashboard|good/i)).toBeVisible({ timeout: 15000 });
  });
});
