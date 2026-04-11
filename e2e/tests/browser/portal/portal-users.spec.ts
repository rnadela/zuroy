import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Portal Users Full Flow', () => {
  test('1. users list shows admin', async ({ adminPage: page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('admin@zuroy.com', { timeout: 15000 });
  });

  test('2. new user form loads', async ({ adminPage: page }) => {
    await page.goto('/users/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 });
  });
});
