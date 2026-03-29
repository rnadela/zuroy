import { execSync } from 'node:child_process';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DB_ROOT = path.resolve(__dirname, '../packages/database');

export default async function globalSetup() {
  const testDbUrl =
    process.env.DATABASE_URL_TEST ||
    'postgresql://postgres:postgres@localhost:5432/zuroy_test';

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
