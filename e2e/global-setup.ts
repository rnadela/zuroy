import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_ROOT = path.resolve(__dirname, '../packages/database');
const API_PORT = process.env.E2E_API_PORT || '3001';
const API_URL = `http://localhost:${API_PORT}/v1`;

export default async function globalSetup() {
  const testDbUrl =
    process.env.DATABASE_URL_TEST ||
    'postgresql://postgres:postgres@localhost:5432/zuroy_test';

  // Write .env.local for Portal and Connect so NEXT_PUBLIC_API_URL is available
  const portalEnv = path.resolve(__dirname, '../apps/portal/.env.local');
  const connectEnv = path.resolve(__dirname, '../apps/connect/.env.local');
  writeFileSync(portalEnv, `NEXT_PUBLIC_API_URL=${API_URL}\n`);
  writeFileSync(connectEnv, `NEXT_PUBLIC_API_URL=${API_URL}\n`);
  console.log(`E2E: Wrote .env.local for Portal + Connect (API_URL=${API_URL})`);

  console.log('E2E: Running migrations on test database...');
  execSync(`DATABASE_URL=${testDbUrl} npx prisma migrate deploy`, {
    cwd: DB_ROOT,
    stdio: 'inherit',
  });

  console.log('E2E: Seeding test database...');
  execSync(`DATABASE_URL=${testDbUrl} npx tsx seed-e2e.ts`, {
    cwd: DB_ROOT,
    stdio: 'inherit',
  });
}
