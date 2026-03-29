import { test as base, expect, Page, APIRequestContext } from '@playwright/test';
import { adminLogin, staffLogin } from './helpers';

type Fixtures = {
  adminPage: Page;
  staffPage: Page;
};

export const test = base.extend<Fixtures>({
  adminPage: async ({ page, request }, use) => {
    const token = await adminLogin(request);
    await page.addInitScript((t) => {
      localStorage.setItem('zuroy_token', t);
      localStorage.setItem(
        'zuroy_user',
        JSON.stringify({ id: 'admin', email: 'admin@zuroy.com', role: 'SUPER_ADMIN', firstName: 'Admin', lastName: 'User' }),
      );
    }, token);
    await use(page);
  },

  staffPage: async ({ page, request }, use) => {
    const token = await staffLogin(request);
    await page.addInitScript((t) => {
      localStorage.setItem('zuroy_token', t);
      localStorage.setItem(
        'zuroy_user',
        JSON.stringify({ id: 'staff', email: 'staff@testhotel.com', role: 'HOTEL_STAFF', firstName: 'Staff', lastName: 'User', hotelId: 'test-hotel-id' }),
      );
    }, token);
    await use(page);
  },
});

export { expect };
