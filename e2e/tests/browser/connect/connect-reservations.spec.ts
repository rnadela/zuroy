import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Reservations', () => {
  test('reservations page loads', async ({ staffPage: page }) => {
    await page.goto('/reservations');
    await expect(page.getByText(/reservations/i)).toBeVisible({ timeout: 15000 });
  });

  test('new reservation page loads', async ({ staffPage: page }) => {
    await page.goto('/reservations/new');
    await expect(page.getByLabel(/guest name/i)).toBeVisible({ timeout: 15000 });
  });
});
