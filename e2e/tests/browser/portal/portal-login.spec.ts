import { test, expect } from '@playwright/test';

test.describe('Portal Login', () => {
  test('login page loads with sign in button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible({ timeout: 15000 });
  });

  test('login with valid credentials redirects to dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@zuroy.com');
    await page.getByLabel('Password').fill('AdminPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible({ timeout: 15000 });
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill('admin@zuroy.com');
    await page.getByLabel('Password').fill('wrongpassword1');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 10000 });
  });
});
