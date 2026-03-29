import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const API_PORT = process.env.E2E_API_PORT || '3001';
const API_URL = `http://localhost:${API_PORT}`;
const PORTAL_PORT = process.env.E2E_PORTAL_PORT || '3000';
const PORTAL_URL = `http://localhost:${PORTAL_PORT}`;
const CONNECT_PORT = process.env.E2E_CONNECT_PORT || '3002';
const CONNECT_URL = `http://localhost:${CONNECT_PORT}`;
const testDbUrl =
  process.env.DATABASE_URL_TEST ||
  'postgresql://postgres:postgres@localhost:5432/zuroy_test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  workers: 1,
  globalSetup: './global-setup.ts',
  webServer: [
    {
      command: 'node dist/main.js',
      cwd: path.resolve(__dirname, '../apps/api'),
      port: Number(API_PORT),
      env: {
        DATABASE_URL: testDbUrl,
        API_PORT,
        NODE_ENV: 'test',
        JWT_SECRET: 'e2e-test-secret-minimum-32-characters',
        JWT_EXPIRATION: '15m',
        REDIS_URL: 'redis://localhost:6379',
      },
      reuseExistingServer: false,
    },
    {
      command: `npx next start -p ${PORTAL_PORT}`,
      cwd: path.resolve(__dirname, '../apps/portal'),
      port: Number(PORTAL_PORT),
      env: { NEXT_PUBLIC_API_URL: API_URL },
      reuseExistingServer: false,
    },
    {
      command: `npx next start -p ${CONNECT_PORT}`,
      cwd: path.resolve(__dirname, '../apps/connect'),
      port: Number(CONNECT_PORT),
      env: { NEXT_PUBLIC_API_URL: API_URL },
      reuseExistingServer: false,
    },
  ],
  use: {
    headless: process.env.E2E_HEADLESS !== 'false',
    launchOptions: { slowMo: Number(process.env.E2E_SLOWMO || '0') },
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'api',
      testMatch: 'api/**/*.spec.ts',
      use: { baseURL: API_URL },
    },
    {
      name: 'browser-portal',
      testDir: './tests/browser/portal',
      use: { baseURL: PORTAL_URL },
    },
    {
      name: 'browser-connect',
      testDir: './tests/browser/connect',
      timeout: 60000,
      use: { baseURL: CONNECT_URL },
    },
  ],
});
