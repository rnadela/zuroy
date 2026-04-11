import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Portal Devices Full Flow', () => {
  test('1. devices list page loads', async ({ adminPage: page }) => {
    await page.goto('/devices');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/device/i, { timeout: 15000 });
  });

  test('2. register new device shows API key', async ({ adminPage: page }) => {
    await page.goto('/devices/new');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Serial Number').fill(`E2E-SERIAL-${uid}`);
    await page.getByLabel('Device Model').fill('Samsung Galaxy A15');
    await page.getByRole('button', { name: /register device/i }).click();
    // Should show "Device Registered" confirmation with API key
    await expect(page.locator('body')).toContainText(/device registered|api key/i, { timeout: 15000 });
  });
});
