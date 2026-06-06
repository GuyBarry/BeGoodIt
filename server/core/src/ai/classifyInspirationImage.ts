import { Type } from '@google/genai';
import { AIImageInput, AIModel, generateNewItemClassificationInput } from './ai.provider';

export interface InspirationItem {
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear' | 'Accessories' | 'Undergarment' | 'Activewear';
  colorGroup: 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Orange' | 'Purple' | 'Pink' | 'Brown' | 'Gray' | 'Beige';
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  style: 'Casual' | 'Formal' | 'Smart Casual' | 'Sporty' | 'Bohemian';
  description: string;
}

const ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    category:    { type: Type.STRING, enum: ['Top', 'Bottom', 'Dress', 'Shoes', 'Outerwear', 'Accessories', 'Undergarment', 'Activewear'] },
    colorGroup:  { type: Type.STRING, enum: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Beige'] },
    season:      { type: Type.STRING, enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'] },
    style:       { type: Type.STRING, enum: ['Casual', 'Formal', 'Smart Casual', 'Sporty', 'Bohemian'] },
    description: { type: Type.STRING },
  },
  required: ['category', 'colorGroup', 'season', 'style', 'description'],
};

const SCHEMA = {
  type: Type.OBJECT,
  properties: {
    items: { type: Type.ARRAY, items: ITEM_SCHEMA },
  },
  required: ['items'],
};

const PROMPT = `Analyze this fashion photo and identify every distinct clothing item being worn.

For each item return:
- category: Top | Bottom | Dress | Shoes | Outerwear | Accessories | Undergarment | Activewear
- colorGroup: Black | White | Red | Blue | Green | Yellow | Orange | Purple | Pink | Brown | Gray | Beige (pick the closest dominant color)
- season: Spring | Summer | Fall | Winter | All-Season (based on fabric weight and coverage)
- style: Casual | Formal | Smart Casual | Sporty | Bohemian
- description: 2-3 sentences covering exact color/shade, fabric texture, fit, silhouette, any pattern or print, and notable design details

Rules:
- A full-body dress or jumpsuit counts as one item (category: Dress), not Top + Bottom
- Only include items that are clearly visible — do not guess
- Include shoes and prominent accessories if visible`;

export async function classifyInspirationImage(image: AIImageInput): Promise<InspirationItem[]> {
  const result = await generateNewItemClassificationInput<{ items: InspirationItem[] }>(
    AIModel.GEMINI_2_5_FLASH,
    PROMPT,
    SCHEMA,
    [image],
  );
  return result.items ?? [];
}
