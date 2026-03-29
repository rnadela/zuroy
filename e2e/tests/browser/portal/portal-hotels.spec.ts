import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Portal Hotels', () => {
  test('hotels page loads', async ({ adminPage: page }) => {
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Hotel', { timeout: 30000 });
  });

  test('can navigate to new hotel form', async ({ adminPage: page }) => {
    await page.goto('/hotels/new');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('input').first()).toBeVisible({ timeout: 30000 });
  });

  test('can create a hotel via form', async ({ adminPage: page }) => {
    await page.goto('/hotels/new');
    await page.waitForLoadState('networkidle');
    const inputs = page.locator('input[type="text"]');
    await inputs.first().fill(`E2E Hotel ${uid}`);
    await inputs.nth(1).fill(`e2e-hotel-${uid}`);
    await page.getByRole('button', { name: /create|save|submit/i }).click();
    // Wait for redirect OR success message (client-side nav)
    await expect(page.locator('body')).toContainText(/hotels|created|success/i, { timeout: 15000 });
  });

  test('duplicate slug shows error', async ({ adminPage: page }) => {
    await page.goto('/hotels/new');
    await page.waitForLoadState('networkidle');
    const inputs = page.locator('input[type="text"]');
    await inputs.first().fill('Duplicate Hotel');
    await inputs.nth(1).fill('test-beach-resort');
    await page.getByRole('button', { name: /create|save|submit/i }).click();
    // Should show error alert or stay on form (not redirect to /hotels)
    await page.waitForTimeout(3000);
    const onNewPage = page.url().includes('/hotels/new');
    const hasError = await page.locator('.MuiAlert-root').first().isVisible().catch(() => false);
    expect(onNewPage || hasError).toBeTruthy();
  });
});
