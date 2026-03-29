import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Reservations', () => {
  test('reservations page loads', async ({ staffPage: page }) => {
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Reservation', { timeout: 30000 });
  });

  test('new reservation form loads', async ({ staffPage: page }) => {
    await page.goto('/reservations/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 30000 });
  });
});
