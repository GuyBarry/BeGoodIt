import { ClothingItem } from '../db/entities';
import { AIImageInput, generateEmbedding } from '../ai/ai.provider';
import { classifyInspirationImage } from '../ai/classifyInspirationImage';
import { clothingItemRepository } from '../repositories';
import { bufferToFloats, EMBEDDING_BYTES } from './clothingItem.service';

// ── Math ──────────────────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function pickBestCandidate(candidates: ClothingItem[], targetEmbedding: number[] | null): string {
  // No target embedding — return first candidate (best match by DB classifiers alone)
  if (!targetEmbedding) return candidates[0].id;

  let bestId  = candidates[0].id;
  let bestSim = -Infinity;
  let anyValid = false;

  for (const c of candidates) {
    if (!c.imageEmbedding || c.imageEmbedding.length !== EMBEDDING_BYTES) continue;
    const sim = cosineSimilarity(targetEmbedding, bufferToFloats(c.imageEmbedding));
    if (sim > bestSim) { bestSim = sim; bestId = c.id; }
    anyValid = true;
  }

  // If no candidate had a valid embedding, fall back to first
  return anyValid ? bestId : candidates[0].id;
}

// ── Main service ──────────────────────────────────────────────────────────────

const findMatches = async (userId: string, image: AIImageInput): Promise<string[]> => {
  // Step 1: one Gemini vision call — detects and classifies every item in the photo
  const detectedItems = await classifyInspirationImage(image);
  if (detectedItems.length === 0) return [];

  // Step 2: DB queries and description embeddings run fully in parallel
  const [candidateSets, targetEmbeddings] = await Promise.all([
    Promise.all(
      detectedItems.map((item) =>
        clothingItemRepository.findMatchingForItem(
          userId,
          item.category,
          item.colorGroup,
          item.season,
          item.style,
        ),
      ),
    ),
    Promise.all(
      // One text-embedding-004 call per detected item — cheap and fast
      detectedItems.map((item) =>
        generateEmbedding(item.description).catch(() => null),
      ),
    ),
  ]);

  // Step 3: pick best candidate per item using cosine similarity (pure math, no AI calls)
  const matchedIds = detectedItems.map((_, i) => {
    const candidates = candidateSets[i];
    if (candidates.length === 0) return null;          // no match in closet — skip
    if (candidates.length === 1) return candidates[0].id; // only one option
    return pickBestCandidate(candidates, targetEmbeddings[i]);
  });

  // Deduplicate and remove nulls
  return [...new Set(matchedIds.filter((id): id is string => !!id))];
};

export const inspirationMatchingService = { findMatches };
