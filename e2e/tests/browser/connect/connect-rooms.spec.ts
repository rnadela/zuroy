import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Rooms', () => {
  test('rooms page loads', async ({ staffPage: page }) => {
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Room', { timeout: 30000 });
  });

  test('new room form loads', async ({ staffPage: page }) => {
    await page.goto('/rooms/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 30000 });
  });
});
