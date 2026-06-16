import * as fs from 'fs';
import * as path from 'path';
import { AppDataSource } from '../../../db/datasource';
import { userRepository } from '../../../repositories';

export const STATE_FILE_PATH = path.join(process.cwd(), '.e2e-test-state.json');

export interface E2ETestState {
  testUserId: string;
}

export default async function globalSetup(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const timestamp = Date.now();
  const testUser = await userRepository.createPasswordUser({
    username: `e2e_user_${timestamp}`,
    email: `e2e_${timestamp}@begoodit-e2e.test`,
    passwordHash: '$2b$10$e2etesthashplaceholderonly00000',
  });

  const state: E2ETestState = { testUserId: testUser.id };
  fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');

  console.log(`\n[E2E Setup] Created test user: ${testUser.id}`);
  await AppDataSource.destroy();
}
