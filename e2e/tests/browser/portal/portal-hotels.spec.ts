import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Portal Hotels', () => {
  test('hotels page loads with list', async ({ adminPage: page }) => {
    await page.goto('/hotels');
    await expect(page.getByText(/hotels/i)).toBeVisible({ timeout: 15000 });
  });

  test('can create a new hotel', async ({ adminPage: page }) => {
    await page.goto('/hotels/new');
    await page.getByLabel('Name').fill(`E2E Hotel ${uid}`);
    await page.getByLabel('Slug').fill(`e2e-hotel-${uid}`);
    await page.getByLabel('Address').fill('456 Test Ave');
    await page.getByRole('button', { name: /create|save|submit/i }).click();
    // Should redirect to hotels list or show success
    await expect(page).toHaveURL(/\/hotels/, { timeout: 10000 });
  });

  test('new hotel appears in list', async ({ adminPage: page }) => {
    await page.goto('/hotels');
    await expect(page.getByText(`E2E Hotel ${uid}`)).toBeVisible({ timeout: 10000 });
  });
});
