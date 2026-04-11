import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();
const hotelName = `E2E Hotel ${uid}`;
const hotelSlug = `e2e-hotel-${uid}`;

test.describe('Portal Hotels Full CRUD', () => {
  test('1. hotels list page shows seeded hotel', async ({ adminPage: page }) => {
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText('Test Beach Resort', { timeout: 15000 });
  });

  test('2. create new hotel via form', async ({ adminPage: page }) => {
    await page.goto('/hotels/new');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Name').fill(hotelName);
    await page.getByLabel('Slug').fill(hotelSlug);
    await page.getByLabel('Address').fill('123 E2E Street');
    await page.getByRole('button', { name: /create hotel/i }).click();
    // Redirects to /hotels
    await expect(page).toHaveURL(/\/hotels$/, { timeout: 15000 });
  });

  test('3. new hotel appears in list', async ({ adminPage: page }) => {
    await page.goto('/hotels');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(hotelName, { timeout: 10000 });
  });

  test('4. duplicate slug shows error', async ({ adminPage: page }) => {
    await page.goto('/hotels/new');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Name').fill('Duplicate Test');
    await page.getByLabel('Slug').fill('test-beach-resort'); // seeded slug
    await page.getByLabel('Address').fill('123 Test');
    await page.getByRole('button', { name: /create hotel/i }).click();
    await page.waitForTimeout(3000);
    // Stays on form OR shows alert
    const onFormPage = page.url().includes('/hotels/new');
    const hasAlert = await page.locator('.MuiAlert-root').first().isVisible().catch(() => false);
    expect(onFormPage || hasAlert).toBeTruthy();
  });
});
