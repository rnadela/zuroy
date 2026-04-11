import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Dashboard', () => {
  test('dashboard loads with greeting', async ({ staffPage: page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Should show time-of-day greeting
    await expect(page.locator('body')).toContainText(/good|dashboard/i, { timeout: 15000 });
  });

  test('sidebar has staff nav items', async ({ staffPage: page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Should have Rooms, Reservations, etc in sidebar
    await expect(page.locator('body')).toContainText(/rooms/i);
    await expect(page.locator('body')).toContainText(/reservations/i);
  });
});
