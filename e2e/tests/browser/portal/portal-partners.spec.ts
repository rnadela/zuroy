import { test, expect } from '../../../browser-fixtures';

test.describe('Portal Partners', () => {
  test('partners page loads', async ({ adminPage: page }) => {
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Partner', { timeout: 30000 });
  });
});
