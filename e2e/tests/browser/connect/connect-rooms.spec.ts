import { test, expect } from '../../../browser-fixtures';

const uid = Date.now() % 10000; // Room number must be short
const roomNumber = `E${uid}`;

test.describe('Connect Rooms Full CRUD', () => {
  test('1. rooms list page loads', async ({ staffPage: page }) => {
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(/room/i, { timeout: 15000 });
  });

  test('2. create room via form', async ({ staffPage: page }) => {
    await page.goto('/rooms/new');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Room Number').fill(roomNumber);
    await page.getByLabel('Floor').fill('3');
    await page.getByRole('button', { name: /create room/i }).click();
    await expect(page).toHaveURL(/\/rooms$/, { timeout: 15000 });
  });

  test('3. new room appears in list', async ({ staffPage: page }) => {
    await page.goto('/rooms');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('body')).toContainText(roomNumber, { timeout: 10000 });
  });
});
