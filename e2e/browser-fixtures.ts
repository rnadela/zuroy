import { test as base, expect, Page, APIRequestContext } from '@playwright/test';
import { adminLogin, staffLogin } from './helpers';

type Fixtures = {
  adminPage: Page;
  staffPage: Page;
};

export const test = base.extend<Fixtures>({
  adminPage: async ({ page, request }, use) => {
    const { accessToken, user } = await adminLogin(request);
    await page.addInitScript(
      ({ token, userData }) => {
        localStorage.setItem('zuroy_token', token);
        localStorage.setItem('zuroy_user', JSON.stringify(userData));
      },
      { token: accessToken, userData: user },
    );
    await use(page);
  },

  staffPage: async ({ page, request }, use) => {
    const { accessToken, user } = await staffLogin(request);
    await page.addInitScript(
      ({ token, userData }) => {
        localStorage.setItem('zuroy_token', token);
        localStorage.setItem('zuroy_user', JSON.stringify(userData));
      },
      { token: accessToken, userData: user },
    );
    await use(page);
  },
});

export { expect };
