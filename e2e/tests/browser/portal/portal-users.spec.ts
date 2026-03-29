import { test, expect } from '../../../browser-fixtures';

test.describe('Portal Users', () => {
  test('users page loads', async ({ adminPage: page }) => {
    await page.goto('/users');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('User', { timeout: 30000 });
  });
});
