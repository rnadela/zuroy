import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Connect Amenities Full Flow', () => {
  test('1. amenities list page loads', async ({ staffPage: page }) => {
    await page.goto('/amenities');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/amenit/i, { timeout: 15000 });
  });

  test('2. new amenity form loads with name field', async ({ staffPage: page }) => {
    await page.goto('/amenities/new');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel(/name/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('3. can create an amenity via form', async ({ staffPage: page }) => {
    await page.goto('/amenities/new');
    await page.waitForLoadState('networkidle');
    await page.getByLabel(/name/i).first().fill(`E2E Amenity ${uid}`);
    await page.getByLabel(/description/i).fill('E2E test amenity');
    // MUI Select: click the select trigger div and pick first option
    await page.locator('div[role="combobox"]').first().click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: /create amenity/i }).click();
    // Should redirect to /amenities (list)
    await expect(page).toHaveURL(/\/amenities$/, { timeout: 15000 });
  });
});
