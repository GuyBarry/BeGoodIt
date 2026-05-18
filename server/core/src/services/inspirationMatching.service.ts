import { Type } from '@google/genai';
import { ClothingItem } from '../db/entities';
import { AIImageInput, AIModel, generateNewItemClassificationInput } from '../ai/ai.provider';
import { classifyInspirationImage, InspirationItem } from '../ai/classifyInspirationImage';
import { clothingItemRepository } from '../repositories';

// ── AI ranking ────────────────────────────────────────────────────────────────

const RANK_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    matchedId: { type: Type.STRING },
  },
  required: ['matchedId'],
};

function buildCandidateDescription(item: ClothingItem): string {
  if (item.imageEmbedding) return item.imageEmbedding.toString('utf8');
  // Fallback for items added before embeddings were introduced
  return item.style ? `Style: ${item.style}` : 'No description available';
}

async function rankBestMatch(
  target: InspirationItem,
  candidates: ClothingItem[],
): Promise<string | null> {
  // Single candidate — no AI call needed
  if (candidates.length === 1) return candidates[0].id;

  // All candidates lack descriptions — skip AI, take first (closest by DB classifiers)
  const hasAnyDescription = candidates.some((c) => c.imageEmbedding);
  if (!hasAnyDescription) return candidates[0].id;

  const candidateLines = candidates
    .map((c) => `ID "${c.id}": "${buildCandidateDescription(c)}"`)
    .join('\n');

  const prompt = `Match a target clothing item to the best candidate from a wardrobe.

TARGET:
Category: ${target.category} | Color: ${target.colorGroup} | Style: ${target.style} | Season: ${target.season}
Description: "${target.description}"

CANDIDATES:
${candidateLines}

Return the id of the single best matching candidate. Prioritize: color accuracy, silhouette/fit, style compatibility. Return empty string if none is a reasonable match.`;

  const result = await generateNewItemClassificationInput<{ matchedId: string }>(
    AIModel.GEMINI_2_5_FLASH,
    prompt,
    RANK_SCHEMA,
  );

  return result.matchedId?.trim() || null;
}

// ── Main service ──────────────────────────────────────────────────────────────

const findMatches = async (userId: string, image: AIImageInput): Promise<string[]> => {
  // Step 1: classify all items visible in the inspiration photo (1 AI call)
  const detectedItems = await classifyInspirationImage(image);
  if (detectedItems.length === 0) return [];

  // Step 2: query DB for each detected item in parallel
  const candidateSets = await Promise.all(
    detectedItems.map((item) =>
      clothingItemRepository.findMatchingForItem(
        userId,
        item.category,
        item.colorGroup,
        item.season,
        item.style,
      ),
    ),
  );

  // Step 3: AI-rank candidates for each item in parallel (skips items with no candidates)
  const rankingResults = await Promise.all(
    detectedItems.map((item, i) => {
      const candidates = candidateSets[i];
      if (candidates.length === 0) return Promise.resolve(null);
      return rankBestMatch(item, candidates).catch(() => candidates[0]?.id ?? null);
    }),
  );

  // Step 4: deduplicate and filter nulls
  return [...new Set(rankingResults.filter((id): id is string => !!id))];
};

export const inspirationMatchingService = { findMatches };
