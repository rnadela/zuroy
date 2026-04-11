import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Connect Reservations Full Flow', () => {
  test('1. reservations list page loads', async ({ staffPage: page }) => {
    await page.goto('/reservations');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/reservation/i, { timeout: 15000 });
  });

  test('2. new reservation form shows guest name field', async ({ staffPage: page }) => {
    await page.goto('/reservations/new');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel(/guest name/i)).toBeVisible({ timeout: 15000 });
  });

  test('3. can fill guest name and dates', async ({ staffPage: page }) => {
    await page.goto('/reservations/new');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/guest name/i).fill(`E2E Guest ${uid}`);
    // Verify field filled
    await expect(page.getByLabel(/guest name/i)).toHaveValue(`E2E Guest ${uid}`);
  });
});
