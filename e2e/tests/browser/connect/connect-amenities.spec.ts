import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Amenities', () => {
  test('amenities page loads', async ({ staffPage: page }) => {
    await page.goto('/amenities');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Amenit', { timeout: 30000 });
  });

  test('new amenity form loads', async ({ staffPage: page }) => {
    await page.goto('/amenities/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 30000 });
  });
});
