import * as fs from 'fs';
import * as path from 'path';
import express from 'express';
import cors from 'cors';
import { In } from 'typeorm';
import { closetRouter } from '../../../controllers/closet.controller';
import { fittingRoomRouter } from '../../../controllers/fittingRoom.controller';
import { errorHandler } from '../../../middlewares/error.middleware';
import { AppDataSource } from '../../../db/datasource';
import { clothingItemRepository, imageRepository, userRepository } from '../../../repositories';

// ── Paths ──────────────────────────────────────────────────────────────────────
const IMAGES_ROOT = path.join(__dirname, '../resources/images');
const GROUND_TRUTH_PATH = path.join(__dirname, '../resources/groundTruth.json');
const STATE_FILE_PATH = path.join(process.cwd(), '.e2e-test-state.json');

// ── Ground-truth types ─────────────────────────────────────────────────────────
export interface ExpectedClassification {
  category?: string[];
  colorGroup?: string[];
  season?: string[];
  style?: string[];
}

export interface TestCase {
  id: string;
  testSuite: string;
  imagePath: string;
  mimeType?: string;
  expectedHttpStatus?: number;
  expectedBehavior?: 'rejection' | 'semanticMatch';
  expectedErrorSubstring?: string;
  expectedClassification?: ExpectedClassification;
  expectedDescriptionKeywords?: string[];
}

export interface GroundTruth {
  testCases: TestCase[];
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Read a test image from the resources/images directory. Throws with a clear
 *  message if the file is missing (i.e. user has not yet placed their images). */
export function readTestImage(relativePath: string): Buffer {
  const fullPath = path.join(IMAGES_ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(
      `[E2E] Test image not found: ${fullPath}\n` +
        `Please add the image as described in src/__tests__/e2e/resources/images/TODO.md`,
    );
  }
  return fs.readFileSync(fullPath);
}

/** Load the entire ground-truth JSON file. */
export function loadGroundTruth(): GroundTruth {
  return JSON.parse(fs.readFileSync(GROUND_TRUTH_PATH, 'utf8')) as GroundTruth;
}

/** Look up a single test case by ID. Throws if not found. */
export function getTestCase(id: string): TestCase {
  const gt = loadGroundTruth();
  const tc = gt.testCases.find((t) => t.id === id);
  if (!tc) throw new Error(`[E2E] Ground-truth test case not found: "${id}"`);
  return tc;
}

/** Read the test user ID written by globalSetup. */
export function getTestUserId(): string {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    throw new Error(
      '[E2E] .e2e-test-state.json not found.\n' +
        'Run tests with: npm run test:e2e (not npm test) so that globalSetup executes first.',
    );
  }
  return (JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf8')) as { testUserId: string }).testUserId;
}

/** Build a minimal Express app that wires up only the routes exercised by E2E
 *  tests. The real services and repositories are used — no mocks. The DB must
 *  already be initialized (done in beforeAll via ensureDbInitialized). */
export function buildTestApp(): express.Express {
  const app = express();
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/closet', closetRouter);
  app.use('/fitting-room', fittingRoomRouter);
  app.use(errorHandler);
  return app;
}

/** Initialize the TypeORM AppDataSource if it has not been initialized yet.
 *  Safe to call multiple times in the same process (runInBand). */
export async function ensureDbInitialized(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}

/** Lenient assertion: checks that `actual` is a member of the `allowed` set.
 *  Throws a descriptive error on mismatch so test failures are easy to read. */
export function assertOneOf(actual: string | null | undefined, allowed: string[], label: string): void {
  if (actual == null) {
    throw new Error(`[E2E Assert] ${label}: value is null/undefined, expected one of: [${allowed.join(', ')}]`);
  }
  if (!allowed.includes(actual)) {
    throw new Error(
      `[E2E Assert] ${label}: got "${actual}", expected one of: [${allowed.join(', ')}]`,
    );
  }
}

/** Assert that `text` contains at least one of the provided keyword strings
 *  (case-insensitive). */
export function assertContainsKeyword(text: string, keywords: string[], label: string): void {
  const lower = text.toLowerCase();
  const hit = keywords.some((kw) => lower.includes(kw.toLowerCase()));
  if (!hit) {
    throw new Error(
      `[E2E Assert] ${label}: description did not match any expected keyword.\n` +
        `  Expected one of: [${keywords.join(', ')}]\n` +
        `  Actual description: "${text.slice(0, 200)}..."`,
    );
  }
}

/**
 * Full teardown: deletes the test user (cascading clothing_item, outfit,
 * body_mapping rows), cleans up orphaned image blobs, and removes the
 * .e2e-test-state.json file.
 *
 * Called from searchAccuracy.e2e.spec.ts afterAll so that cleanup happens in
 * the test-runner process (not a separate globalTeardown process) and can
 * safely reuse the already-initialized AppDataSource.
 */
export async function teardownTestUser(): Promise<void> {
  if (!fs.existsSync(STATE_FILE_PATH)) {
    console.warn('[E2E] teardownTestUser: state file not found, skipping cleanup');
    return;
  }

  const { testUserId } = JSON.parse(fs.readFileSync(STATE_FILE_PATH, 'utf8')) as {
    testUserId: string;
  };

  // Collect imageIds before the cascade-delete removes clothing_item rows
  const items = await clothingItemRepository.find({
    where: { userId: testUserId },
    select: ['imageId'],
  });
  const imageIds = items
    .map((item) => item.imageId)
    .filter((id): id is string => id !== null);

  // Deleting the user cascades to clothing_item, body_mapping, outfit rows
  await userRepository.delete({ id: testUserId });
  console.log(`[E2E Teardown] Deleted test user: ${testUserId}`);

  // Images have no FK to user — clean them up separately
  if (imageIds.length > 0) {
    await imageRepository.delete({ id: In(imageIds) });
    console.log(`[E2E Teardown] Deleted ${imageIds.length} orphaned image(s)`);
  }

  fs.unlinkSync(STATE_FILE_PATH);
}
