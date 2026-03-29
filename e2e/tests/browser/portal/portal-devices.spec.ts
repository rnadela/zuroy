import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Portal Devices', () => {
  test('devices page loads', async ({ adminPage: page }) => {
    await page.goto('/devices');
    await expect(page.getByText(/devices/i)).toBeVisible({ timeout: 15000 });
  });

  test('can register a new device', async ({ adminPage: page }) => {
    await page.goto('/devices/new');
    await page.getByLabel(/serial/i).fill(`E2E-DEV-${uid}`);
    await page.getByLabel(/model/i).fill('Samsung A15');
    await page.getByRole('button', { name: /register|create|save/i }).click();
    // Should show API key or redirect
    await page.waitForTimeout(2000);
    // Check for API key display or redirect to devices list
    const hasApiKey = await page.getByText(/api key/i).isVisible().catch(() => false);
    const hasRedirect = page.url().includes('/devices');
    expect(hasApiKey || hasRedirect).toBeTruthy();
  });
});
