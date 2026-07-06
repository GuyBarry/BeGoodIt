/**
 * E2E — Search Accuracy
 *
 * Suite 6 of the E2E AI pipeline test plan.
 *
 * Validates the complete upload → AI process → embed → DB save → search flow.
 *
 * Three search paths are exercised:
 *   6A. Precise filter search  — GET /closet/:userId with category / color / season params
 *   6B. Semantic / vague search — POST /fitting-room/:userId/find-matches with an outfit
 *       photo; similarity is computed via stored embeddings (no extra AI call at query time)
 *   6C. No-results / bad queries — verifies graceful empty-result responses
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
  assertOneOf,
  buildTestApp,
  ensureDbInitialized,
  getTestCase,
  getTestUserId,
  readTestImage,
  teardownTestUser,
} from './setup/helpers';

// ── Shared state ───────────────────────────────────────────────────────────────
let app: Express;
let TEST_USER_ID: string;

// IDs of items uploaded in beforeAll — used to verify search results and clean up
let redDressId: string;
let blueJeansId: string;
let whiteSneakersId: string;

// ──────────────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await ensureDbInitialized();
  TEST_USER_ID = getTestUserId();
  app = buildTestApp();

  // Upload three distinct items so we can test precise filter matches and
  // ensure non-matching filters truly return empty results.
  // These calls exercise the full pipeline: background removal → AI classification
  // → embedding generation → DB persistence.
  const [dressRes, jeansRes, sneakersRes] = await Promise.all([
    uploadSearchItem('search-red-dress'),
    uploadSearchItem('search-blue-jeans'),
    uploadSearchItem('search-white-sneakers'),
  ]);

  expect(dressRes.status).toBe(201);
  expect(jeansRes.status).toBe(201);
  expect(sneakersRes.status).toBe(201);

  redDressId = dressRes.body.id;
  blueJeansId = jeansRes.body.id;
  whiteSneakersId = sneakersRes.body.id;
});

afterAll(async () => {
  // Delete the three uploaded items via the API to exercise the DELETE endpoint
  await Promise.all(
    [redDressId, blueJeansId, whiteSneakersId]
      .filter(Boolean)
      .map((id) =>
        request(app)
          .delete(`/closet/${TEST_USER_ID}/items/${id}`)
          .then(() => void 0)
          .catch(() => void 0), // tolerate already-deleted items
      ),
  );

  // Full teardown: removes test user (cascade), orphaned image blobs, state file.
  // searchAccuracy is guaranteed to be the last test file (alphabetical sequencer
  // ensures clothingClassification runs first), so deleting the state file here
  // is safe.
  await teardownTestUser();
});

// ── Helper ─────────────────────────────────────────────────────────────────────
async function uploadSearchItem(testCaseId: string): Promise<request.Response> {
  const tc = getTestCase(testCaseId);
  const imageBuffer = readTestImage(tc.imagePath);
  const filename = tc.imagePath.split('/').pop() ?? 'item.jpg';
  return request(app)
    .post(`/closet/${TEST_USER_ID}/items`)
    .attach('file', imageBuffer, { filename, contentType: tc.mimeType ?? 'image/jpeg' });
}

// ──────────────────────────────────────────────────────────────────────────────
// Suite 6A: Precise Filter Search
//
// The closet GET endpoint supports exact-match filters on category name,
// colorGroup name, and season name.  Each test verifies that the item uploaded
// in beforeAll appears in the filtered result set.
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 6A — Precise Filter Search', () => {
  it('should retrieve the red dress when filtering by category=Dress', async () => {
    // The AI may return a slightly different category name (e.g. "Dress") — use
    // the value actually stored on the item to build the filter query.
    const itemRes = await request(app).get(`/closet/${TEST_USER_ID}?limit=100`);
    expect(itemRes.status).toBe(200);

    const dress = itemRes.body.items.find((i: { id: string }) => i.id === redDressId);
    expect(dress).toBeDefined();

    const tc = getTestCase('search-red-dress');
    assertOneOf(dress.category?.name, tc.expectedClassification!.category!, 'red dress category');

    // Now use the real stored category name to perform a category filter query
    const categoryName: string = dress.category.name;
    const filtered = await request(app).get(
      `/closet/${TEST_USER_ID}?category=${encodeURIComponent(categoryName)}&limit=100`,
    );

    expect(filtered.status).toBe(200);
    const ids: string[] = filtered.body.items.map((i: { id: string }) => i.id);
    expect(ids).toContain(redDressId);
  });

  it('should retrieve the blue jeans when filtering by color=Blue', async () => {
    const itemRes = await request(app).get(`/closet/${TEST_USER_ID}?limit=100`);
    expect(itemRes.status).toBe(200);

    const jeans = itemRes.body.items.find((i: { id: string }) => i.id === blueJeansId);
    expect(jeans).toBeDefined();

    const tc = getTestCase('search-blue-jeans');
    assertOneOf(jeans.colorGroups?.[0]?.name, tc.expectedClassification!.colorGroup!, 'jeans colorGroup');

    const colorName: string = jeans.colorGroups[0].name;
    const filtered = await request(app).get(
      `/closet/${TEST_USER_ID}?color=${encodeURIComponent(colorName)}&limit=100`,
    );

    expect(filtered.status).toBe(200);
    const ids: string[] = filtered.body.items.map((i: { id: string }) => i.id);
    expect(ids).toContain(blueJeansId);
  });

  it('should retrieve white sneakers when filtering by category=Shoes and a white colorGroup', async () => {
    const itemRes = await request(app).get(`/closet/${TEST_USER_ID}?limit=100`);
    expect(itemRes.status).toBe(200);

    const sneakers = itemRes.body.items.find((i: { id: string }) => i.id === whiteSneakersId);
    expect(sneakers).toBeDefined();

    const tc = getTestCase('search-white-sneakers');
    assertOneOf(sneakers.category?.name, tc.expectedClassification!.category!, 'sneakers category');
    assertOneOf(sneakers.colorGroups?.[0]?.name, tc.expectedClassification!.colorGroup!, 'sneakers colorGroup');

    const categoryName: string = sneakers.category.name;
    const colorName: string = sneakers.colorGroups[0].name;
    const filtered = await request(app).get(
      `/closet/${TEST_USER_ID}?category=${encodeURIComponent(categoryName)}&color=${encodeURIComponent(colorName)}&limit=100`,
    );

    expect(filtered.status).toBe(200);
    const ids: string[] = filtered.body.items.map((i: { id: string }) => i.id);
    expect(ids).toContain(whiteSneakersId);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 6B: Semantic / Vague Search (Inspiration Matching)
//
// Exercises the full embedding pipeline end-to-end:
//   1. The inspiration outfit image is sent to POST /fitting-room/:userId/find-matches
//   2. The server calls classifyInspirationImage() on the outfit photo to detect
//      visible garments and generate description embeddings for each
//   3. For each detected item, a DB query retrieves candidates by category+color
//   4. Cosine similarity ranks the candidates
//   5. The test asserts that the previously uploaded red dress appears in the result
//
// The inspiration-outfit.jpg should show a red dress (or a model wearing one) so
// that the system successfully matches it against the stored red dress item.
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 6B — Semantic / Vague Search (Inspiration Matching)', () => {
  it('should find the red dress in the closet from an inspiration outfit photo', async () => {
    const tc = getTestCase('search-inspiration');
    const imageBuffer = readTestImage(tc.imagePath);

    const response = await request(app)
      .post(`/fitting-room/${TEST_USER_ID}/find-matches`)
      .attach('file', imageBuffer, {
        filename: 'inspiration-outfit.jpg',
        contentType: tc.mimeType ?? 'image/jpeg',
      });

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.matchedItemIds)).toBe(true);
    expect(response.body.matchedItemIds).toContain(redDressId);
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// Suite 6C: No Results / Bad Queries
//
// Verifies that the API returns clean empty result sets rather than errors when
// filter criteria do not match any stored items.
// ──────────────────────────────────────────────────────────────────────────────
describe('Suite 6C — No Results / Bad Queries', () => {
  it('should return an empty item list for a category+color combo with no matching items', async () => {
    // The test user has: red dress, blue jeans, white sneakers.
    // "Outerwear + Green" does not exist in their closet.
    const response = await request(app).get(
      `/closet/${TEST_USER_ID}?category=Outerwear&color=Green&limit=100`,
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(0);
    expect(response.body.total).toBe(0);
  });

  it('should return an empty item list for a search string that matches nothing', async () => {
    const response = await request(app).get(
      `/closet/${TEST_USER_ID}?search=xyzzy_nonexistent_garment_NORESULT_12345&limit=100`,
    );

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(0);
    expect(response.body.total).toBe(0);
  });
});
