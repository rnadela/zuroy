import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Service Requests', () => {
  test('requests page loads', async ({ staffPage: page }) => {
    await page.goto('/requests');
    await expect(page.getByText(/service request/i)).toBeVisible({ timeout: 15000 });
  });
});
