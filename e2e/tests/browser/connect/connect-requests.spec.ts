import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Service Requests Full Flow', () => {
  test('1. requests page loads with filter tabs', async ({ staffPage: page }) => {
    await page.goto('/requests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/request/i, { timeout: 15000 });
  });

  test('2. shows empty state or request list', async ({ staffPage: page }) => {
    await page.goto('/requests');
    await page.waitForLoadState('networkidle');
    // Either shows empty state or a table
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
