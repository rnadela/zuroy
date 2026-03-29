import { test, expect } from '../../../browser-fixtures';

test.describe('Portal Partners', () => {
  test('partners page loads', async ({ adminPage: page }) => {
    await page.goto('/partners');
    await expect(page.getByText(/partners/i)).toBeVisible({ timeout: 15000 });
  });
});
