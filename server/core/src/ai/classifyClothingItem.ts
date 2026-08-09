import { Type } from '@google/genai';
import { AIImageInput, AIModel, generateNewItemClassificationInput } from './ai.provider';

export interface ClothingClassification {
  noClothingDetected: boolean;
  // True when the garment is shown worn by a person or on a mannequin (model /
  // lifestyle photo); false for a standalone product shot of just the garment.
  isWornByModel: boolean;
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear' | 'Accessories' | 'Undergarment' | 'Activewear';
  colorGroups: ('Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Orange' | 'Purple' | 'Pink' | 'Brown' | 'Gray' | 'Beige')[];
  seasons: ('Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season')[];
  styles: ('Casual' | 'Formal' | 'Smart Casual' | 'Sporty' | 'Bohemian')[];
  description: string;
}

const CLASSIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    noClothingDetected: {
      type: Type.BOOLEAN,
      description:
        'Set to true ONLY when the image contains no clothing at all (e.g. a landscape, food, furniture, a face). Set to false for every valid clothing item.',
    },
    isWornByModel: {
      type: Type.BOOLEAN,
      description:
        'Set to true when the garment is being worn by a person or shown on a mannequin (a model/lifestyle photo). Set to false when the image is a standalone product shot of just the garment (flat-lay, ghost mannequin, or on a plain background with no person).',
    },
    category: {
      type: Type.STRING,
      enum: ['Top', 'Bottom', 'Dress', 'Shoes', 'Outerwear', 'Accessories', 'Undergarment', 'Activewear'],
    },
    colorGroups: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Beige'] },
      description: 'One or more dominant color groups visible on the item.',
    },
    seasons: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'] },
      description: 'One or more seasons this item is suited for.',
    },
    styles: {
      type: Type.ARRAY,
      items: { type: Type.STRING, enum: ['Casual', 'Formal', 'Smart Casual', 'Sporty', 'Bohemian'] },
      description: 'One or more style categories that apply to this item.',
    },
    description: {
      type: Type.STRING,
      description: 'A rich 1-3 sentence description of the item covering exact color/shade, fabric texture, fit, silhouette, pattern, notable design details, and occasion suitability. This will be used for semantic similarity matching.',
    },
  },
  required: ['noClothingDetected', 'isWornByModel', 'category', 'colorGroups', 'seasons', 'styles', 'description'],
};

const BASE_PROMPT = `Analyze this image and return the following fields.

- noClothingDetected: set to true ONLY if the image contains NO clothing whatsoever (e.g. a landscape, food, furniture, a blank wall, a face with no visible clothing). Set to false for all clothing items. When true, still provide placeholder values for the remaining fields — they will be ignored.
- isWornByModel: set to true if the garment is worn by a person or shown on a mannequin (a model/lifestyle photo); set to false if it is a standalone product shot of just the garment (flat-lay, ghost mannequin, or on a plain background with no person)
- category: pick exactly one of: Top, Bottom, Dress, Shoes, Outerwear, Accessories, Undergarment, Activewear
- colorGroups: pick at least one (can be multiple) from: Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Gray, Beige
- seasons: pick at least one (can be multiple) from: Spring, Summer, Fall, Winter, All-Season
  (base on fabric weight — lightweight → Spring/Summer, heavy/insulating → Fall/Winter, only use All-Season for genuine basics like plain tees or jeans)
- styles: pick at least one (can be multiple) from: Casual, Formal, Smart Casual, Sporty, Bohemian
- description: write 1-3 sentences describing the item in detail — cover the exact color/shade, fabric texture and weight, fit and silhouette, any visible pattern or print, notable design details (buttons, pockets, collar type, hem, etc.), and what occasions or outfits it suits. Be specific enough that someone could match it against items in a photo.`;

export async function classifyClothingItem(image: AIImageInput, productTitle?: string): Promise<ClothingClassification> {
  // The product title is the single most reliable category signal (retailers
  // name the garment explicitly), so we hand it to the model as strong context
  // and let it reconcile the words with the image itself — rather than deriving
  // the category from brittle keyword matching. Substring matching used to
  // misfire on things like "short sleeve t-shirt", where "short" looked like a
  // Bottom and hard-overrode the correct image-based classification.
  const hint = productTitle
    ? `\n\nThe product is named "${productTitle}". Treat this title as the primary signal for the category — its garment noun (e.g. "t-shirt", "jeans", "dress") names what the item is, even when the photo is styled on a model wearing a full outfit. Use the image to fill in color, fabric, fit, and details.`
    : '';

  return generateNewItemClassificationInput<ClothingClassification>(
    AIModel.GEMINI_2_5_FLASH,
    BASE_PROMPT + hint,
    CLASSIFICATION_SCHEMA,
    [image],
  );
}
