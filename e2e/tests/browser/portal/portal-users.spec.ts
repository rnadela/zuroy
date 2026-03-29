import { test, expect } from '../../../browser-fixtures';

test.describe('Portal Users', () => {
  test('users page loads', async ({ adminPage: page }) => {
    await page.goto('/users');
    await expect(page.getByText(/users/i)).toBeVisible({ timeout: 15000 });
  });

  test('users list shows existing users', async ({ adminPage: page }) => {
    await page.goto('/users');
    await expect(page.getByText('admin@zuroy.com')).toBeVisible({ timeout: 10000 });
  });
});
