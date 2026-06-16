import * as fs from 'fs';
import * as path from 'path';
import { In } from 'typeorm';
import { AppDataSource } from '../../../db/datasource';
import { clothingItemRepository, imageRepository, userRepository } from '../../../repositories';

const STATE_FILE_PATH = path.join(process.cwd(), '.e2e-test-state.json');

export default async function globalTeardown(): Promise<void> {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    console.warn('\n[E2E Teardown] No state file found — nothing to clean up');
    return;
  }

  const state = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf8'));
  const { testUserId } = state as { testUserId: string };

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  // Collect imageIds before the cascade-delete removes clothing_item rows
  const clothingItems = await clothingItemRepository.find({
    where: { userId: testUserId },
    select: ['imageId'],
  });
  const imageIds = clothingItems
    .map((item) => item.imageId)
    .filter((id): id is string => id !== null);

  // Deleting the user cascades to clothing_item, body_mapping, outfit, outfit_folder rows
  await userRepository.delete({ id: testUserId });
  console.log(`\n[E2E Teardown] Deleted test user: ${testUserId}`);

  // Images are not FK-linked to the user, so clean them up separately
  if (imageIds.length > 0) {
    await imageRepository.delete({ id: In(imageIds) });
    console.log(`[E2E Teardown] Deleted ${imageIds.length} orphaned image(s)`);
  }

  fs.unlinkSync(STATE_FILE_PATH);
  await AppDataSource.destroy();
}
