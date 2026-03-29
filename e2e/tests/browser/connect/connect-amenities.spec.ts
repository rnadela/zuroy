import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Amenities', () => {
  test('amenities page loads', async ({ staffPage: page }) => {
    await page.goto('/amenities');
    await expect(page.getByText(/amenities/i)).toBeVisible({ timeout: 15000 });
  });

  test('new amenity page loads with form', async ({ staffPage: page }) => {
    await page.goto('/amenities/new');
    await expect(page.getByLabel(/name/i)).toBeVisible({ timeout: 15000 });
  });
});
