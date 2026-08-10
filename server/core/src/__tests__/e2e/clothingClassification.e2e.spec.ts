/**
 * E2E — Clothing Classification
 *
 * Suites 1–5 of the E2E AI pipeline test plan.
 *
 * Runs against:
 *   • Real Google Gemini 2.5 Flash (live API calls)
 *   • Real MySQL dev database (local Docker)
 *   • Real Express app (closetRouter + fittingRoomRouter)
 *
 * Prerequisites:
 *   1. Local DB is running  (npm run db:start)
 *   2. .env.e2e has a valid GEMINI_API_KEY
 *   3. All test images in src/__tests__/e2e/resources/images/ exist
 *      (see TODO.md in that directory)
 *
 * Run with:
 *   npm run test:e2e
 */

import request from 'supertest';
import { Express } from 'express';
import {
  assertContainsKeyword,
  assertOneOf,
  buildTestApp,
  ensureDbInitialized,
  getTestCase,
  getTestUserId,
  readTestImage,
} from './setup/helpers';
import { classifyClothingItem } from '../../ai/classifyClothingItem';

// ── Shared state ───────────────────────────────────────────────────────────────
let app: Express;
let TEST_USER_ID: string;

beforeAll(async () => {
  await ensureDbInitialized();
  TEST_USER_ID = getTestUserId();
  app = buildTestApp();
});

// ── Helper: upload via real API ────────────────────────────────────────────────
async function uploadItem(testCaseId: string): Promise<request.Response> {
  const tc = getTestCase(testCaseId);
  const imageBuffer = readTestImage(tc.imagePath);
  const filename = tc.imagePath.split('/').pop() ?? 'test-image.jpg';
  return request(app)
    .post(`/closet/${TEST_USER_ID}/items`)
    .attach('file', imageBuffer, { filename, contentType: tc.mimeType ?? 'image/jpeg' });
}

// ── Helper: delete an item so each test is isolated ───────────────────────────
async function deleteItem(itemId: string): Promise<void> {
  await request(app)
    .delete(`/closet/${TEST_USER_ID}/items/${itemId}`)
    .expect(204);
}

// ──────────────────────────────────────────────────────────────────────────────
// Suite 1: Non-Clothing Detection
// Depends on Phase-0 code change: noClothingDetected flag in classifyClothingItem
// + BadRequestException thrown in closet.service when flag is true
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 1 — Non-Clothing Detection', () => {
  it('should return 400 when uploading a landscape photo', async () => {
    const tc = getTestCase('non-clothing-landscape');
    const imageBuffer = readTestImage(tc.imagePath);

    const response = await request(app)
      .post(`/closet/${TEST_USER_ID}/items`)
      .attach('file', imageBuffer, { filename: 'mountain-landscape.jpg', contentType: 'image/jpeg' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/no clothing detected/i);
  });

  it('should return 400 when uploading a non-clothing object (coffee mug)', async () => {
    const tc = getTestCase('non-clothing-object');
    const imageBuffer = readTestImage(tc.imagePath);

    const response = await request(app)
      .post(`/closet/${TEST_USER_ID}/items`)
      .attach('file', imageBuffer, { filename: 'coffee-mug.jpg', contentType: 'image/jpeg' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/no clothing detected/i);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 2: Type Classification
// Uploads real garment images through the full pipeline and verifies Gemini
// returns the correct category (and a plausible color) for each item.
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 2 — Type Classification', () => {
  let createdItemId: string | null = null;

  afterEach(async () => {
    if (createdItemId) {
      await deleteItem(createdItemId);
      createdItemId = null;
    }
  });

  it('should classify a plain shirt as Top', async () => {
    const tc = getTestCase('type-shirt');
    const response = await uploadItem('type-shirt');

    expect(response.status).toBe(201);
    createdItemId = response.body.id;

    assertOneOf(response.body.category?.name, tc.expectedClassification!.category!, 'category');
    assertOneOf(response.body.colorGroups?.[0]?.name, tc.expectedClassification!.colorGroup!, 'colorGroup');
  });

  it('should classify blue jeans as Bottom', async () => {
    const tc = getTestCase('type-pants');
    const response = await uploadItem('type-pants');

    expect(response.status).toBe(201);
    createdItemId = response.body.id;

    assertOneOf(response.body.category?.name, tc.expectedClassification!.category!, 'category');
    assertOneOf(response.body.colorGroups?.[0]?.name, tc.expectedClassification!.colorGroup!, 'colorGroup');
  });

  it('should classify white sneakers as Shoes', async () => {
    const tc = getTestCase('type-shoes');
    const response = await uploadItem('type-shoes');

    expect(response.status).toBe(201);
    createdItemId = response.body.id;

    assertOneOf(response.body.category?.name, tc.expectedClassification!.category!, 'category');
    assertOneOf(response.body.colorGroups?.[0]?.name, tc.expectedClassification!.colorGroup!, 'colorGroup');
  });

  it('should classify a black puffer jacket as Outerwear', async () => {
    const tc = getTestCase('type-outerwear');
    const response = await uploadItem('type-outerwear');

    expect(response.status).toBe(201);
    createdItemId = response.body.id;

    assertOneOf(response.body.category?.name, tc.expectedClassification!.category!, 'category');
    assertOneOf(response.body.colorGroups?.[0]?.name, tc.expectedClassification!.colorGroup!, 'colorGroup');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 3: Attribute & Pattern Extraction
//
// The `description` field is not persisted to the DB; only its embedding is
// stored.  These tests call classifyClothingItem() directly so they can assert
// on the raw description text returned by Gemini — no DB writes needed.
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 3 — Attribute & Pattern Extraction', () => {
  it('should detect short sleeves in the description for a short-sleeve red shirt', async () => {
    const tc = getTestCase('attr-short-sleeve');
    const imageBuffer = readTestImage(tc.imagePath);

    const result = await classifyClothingItem({
      mimeType: tc.mimeType ?? 'image/jpeg',
      data: imageBuffer,
    });

    expect(result.noClothingDetected).toBe(false);
    assertOneOf(result.category, tc.expectedClassification!.category!, 'category');
    expect(result.colorGroups.some(c => tc.expectedClassification!.colorGroup!.includes(c))).toBe(true);
    assertContainsKeyword(result.description, tc.expectedDescriptionKeywords!, 'sleeve description');
  });

  it('should detect long sleeves in the description for a long-sleeve blue shirt', async () => {
    const tc = getTestCase('attr-long-sleeve');
    const imageBuffer = readTestImage(tc.imagePath);

    const result = await classifyClothingItem({
      mimeType: tc.mimeType ?? 'image/jpeg',
      data: imageBuffer,
    });

    expect(result.noClothingDetected).toBe(false);
    assertOneOf(result.category, tc.expectedClassification!.category!, 'category');
    expect(result.colorGroups.some(c => tc.expectedClassification!.colorGroup!.includes(c))).toBe(true);
    assertContainsKeyword(result.description, tc.expectedDescriptionKeywords!, 'sleeve description');
  });

  it('should detect stripe pattern in the description for a horizontal-stripe t-shirt', async () => {
    const tc = getTestCase('attr-stripes');
    const imageBuffer = readTestImage(tc.imagePath);

    const result = await classifyClothingItem({
      mimeType: tc.mimeType ?? 'image/jpeg',
      data: imageBuffer,
    });

    expect(result.noClothingDetected).toBe(false);
    assertOneOf(result.category, tc.expectedClassification!.category!, 'category');
    assertContainsKeyword(result.description, tc.expectedDescriptionKeywords!, 'pattern description');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 4: Background Noise Robustness
// The AI must isolate the foreground garment even when the background is busy.
// Background removal runs before classification; this test validates the full
// chain from noisy input to correct category output.
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 4 — Background Noise Robustness', () => {
  let createdItemId: string | null = null;

  afterEach(async () => {
    if (createdItemId) {
      await deleteItem(createdItemId);
      createdItemId = null;
    }
  });

  it('should correctly classify a shirt photographed against a cluttered background', async () => {
    const tc = getTestCase('bg-noise-shirt');
    const response = await uploadItem('bg-noise-shirt');

    expect(response.status).toBe(201);
    createdItemId = response.body.id;

    assertOneOf(response.body.category?.name, tc.expectedClassification!.category!, 'category');
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 5: Crumpled / Wrinkled Clothing
// The AI must handle non-ideal input where the garment is visibly wrinkled,
// folded, or crumpled and still return the correct category.
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 5 — Crumpled / Wrinkled Clothing', () => {
  let createdItemId: string | null = null;

  afterEach(async () => {
    if (createdItemId) {
      await deleteItem(createdItemId);
      createdItemId = null;
    }
  });

  it('should correctly classify a visibly wrinkled t-shirt as Top', async () => {
    const tc = getTestCase('crumpled-shirt');
    const response = await uploadItem('crumpled-shirt');

    expect(response.status).toBe(201);
    createdItemId = response.body.id;

    assertOneOf(response.body.category?.name, tc.expectedClassification!.category!, 'category');
    assertOneOf(response.body.colorGroups?.[0]?.name, tc.expectedClassification!.colorGroup!, 'colorGroup');
  });
});
