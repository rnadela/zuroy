import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Portal Partners Full Flow', () => {
  test('1. partners list page loads', async ({ adminPage: page }) => {
    await page.goto('/partners');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/partner/i, { timeout: 15000 });
  });

  test('2. new partner form loads with required fields', async ({ adminPage: page }) => {
    await page.goto('/partners/new');
    await page.waitForLoadState('networkidle');
    await expect(page.getByLabel(/name/i).first()).toBeVisible({ timeout: 15000 });
  });
});
