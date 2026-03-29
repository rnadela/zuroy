import { test, expect } from '../../../browser-fixtures';

const uid = Date.now();

test.describe('Connect Rooms', () => {
  test('rooms page loads', async ({ staffPage: page }) => {
    await page.goto('/rooms');
    await expect(page.getByText(/rooms/i)).toBeVisible({ timeout: 15000 });
  });

  test('can create a room', async ({ staffPage: page }) => {
    await page.goto('/rooms/new');
    await page.getByLabel(/number/i).fill(`${uid % 1000}`);
    // Fill floor if visible
    const floorInput = page.getByLabel(/floor/i);
    if (await floorInput.isVisible().catch(() => false)) {
      await floorInput.fill('3');
    }
    await page.getByRole('button', { name: /create|save|add/i }).click();
    await expect(page).toHaveURL(/\/rooms/, { timeout: 10000 });
  });
});
