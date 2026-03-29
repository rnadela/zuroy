import { test, expect } from '../../../browser-fixtures';

test.describe('Portal Devices', () => {
  test('devices page loads', async ({ adminPage: page }) => {
    await page.goto('/devices');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Device', { timeout: 30000 });
  });

  test('can navigate to register device', async ({ adminPage: page }) => {
    await page.goto('/devices/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 30000 });
  });
});
