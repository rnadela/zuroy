import { test, expect } from '../../../browser-fixtures';

test.describe('Connect Service Requests', () => {
  test('requests page loads', async ({ staffPage: page }) => {
    await page.goto('/requests');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Request', { timeout: 30000 });
  });
});
