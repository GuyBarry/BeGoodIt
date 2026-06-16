import { Type } from '@google/genai';
import { AIImageInput, AIModel, generateNewItemClassificationInput } from './ai.provider';

export interface ClothingClassification {
  noClothingDetected: boolean;
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear' | 'Accessories' | 'Undergarment' | 'Activewear';
  colorGroup: 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Orange' | 'Purple' | 'Pink' | 'Brown' | 'Gray' | 'Beige';
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  style: 'Casual' | 'Formal' | 'Smart Casual' | 'Sporty' | 'Bohemian';
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
    category: {
      type: Type.STRING,
      enum: ['Top', 'Bottom', 'Dress', 'Shoes', 'Outerwear', 'Accessories', 'Undergarment', 'Activewear'],
    },
    colorGroup: {
      type: Type.STRING,
      enum: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Pink', 'Brown', 'Gray', 'Beige'],
    },
    season: {
      type: Type.STRING,
      enum: ['Spring', 'Summer', 'Fall', 'Winter', 'All-Season'],
    },
    style: { type: Type.STRING, enum: ['Casual', 'Formal', 'Smart Casual', 'Sporty', 'Bohemian'] },
    description: {
      type: Type.STRING,
      description: 'A rich 1-3 sentence description of the item covering exact color/shade, fabric texture, fit, silhouette, pattern, notable design details, and occasion suitability. This will be used for semantic similarity matching.',
    },
  },
  required: ['noClothingDetected', 'category', 'colorGroup', 'season', 'style', 'description'],
};

const BASE_PROMPT = `Analyze this image and return the following fields.

- noClothingDetected: set to true ONLY if the image contains NO clothing whatsoever (e.g. a landscape, food, furniture, a blank wall, a face with no visible clothing). Set to false for all clothing items. When true, still provide placeholder values for the remaining fields — they will be ignored.
- category: pick exactly one of: Top, Bottom, Dress, Shoes, Outerwear, Accessories, Undergarment, Activewear
- colorGroup: pick exactly one of: Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Gray, Beige
- season: pick exactly one of: Spring, Summer, Fall, Winter, All-Season
  (base on fabric weight — lightweight → Spring/Summer, heavy/insulating → Fall/Winter, only use All-Season for genuine basics like plain tees or jeans)
- style: pick exactly one of: Casual, Formal, Smart Casual, Sporty, Bohemian
- description: write 1-3 sentences describing the item in detail — cover the exact color/shade, fabric texture and weight, fit and silhouette, any visible pattern or print, notable design details (buttons, pockets, collar type, hem, etc.), and what occasions or outfits it suits. Be specific enough that someone could match it against items in a photo.`;

const CATEGORY_KEYWORDS: { category: ClothingClassification['category']; keywords: string[] }[] = [
  { category: 'Bottom',      keywords: ['short', 'pant', 'jean', 'trouser', 'chino', 'skirt', 'legging', 'jogger', 'bermuda', 'cargo', 'denim'] },
  { category: 'Top',         keywords: ['shirt', ' tee', 't-shirt', 'blouse', 'top', 'sweater', 'hoodie', 'sweatshirt', 'tank', 'polo', 'turtleneck', 'pullover', 'knitwear'] },
  { category: 'Outerwear',   keywords: ['jacket', 'coat', 'blazer', 'parka', 'windbreaker', 'anorak', 'trench', 'puffer', 'vest'] },
  { category: 'Dress',       keywords: ['dress', 'gown', 'jumpsuit', 'romper', 'overall'] },
  { category: 'Shoes',       keywords: ['shoe', 'sneaker', 'boot', 'sandal', 'heel', 'loafer', 'slipper', 'mule', 'trainer', 'runner'] },
  { category: 'Accessories', keywords: ['sunglass', 'glasses', 'watch', 'belt', 'bag', 'hat', 'cap', 'scarf', 'glove', 'wallet', 'jewel', 'necklace', 'bracelet', 'ring', 'earring', 'beanie', 'backpack'] },
  { category: 'Activewear',  keywords: ['sport', 'athletic', 'gym', 'workout', 'running', 'cycling', 'yoga', 'compression'] },
];

const deriveCategory = (title: string): ClothingClassification['category'] | null => {
  const lower = title.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some(kw => lower.includes(kw))) return category;
  }
  return null;
};

export async function classifyClothingItem(image: AIImageInput, productTitle?: string): Promise<ClothingClassification> {
  const derivedCategory = productTitle ? deriveCategory(productTitle) : null;

  const hint = productTitle
    ? derivedCategory
      ? `\n\nIMPORTANT: the product is called "${productTitle}". The category MUST be "${derivedCategory}" — do not change it based on the image.`
      : `\n\nHint: the product is called "${productTitle}" — use this to help determine the correct category.`
    : '';

  return generateNewItemClassificationInput<ClothingClassification>(
    AIModel.GEMINI_2_5_FLASH,
    BASE_PROMPT + hint,
    CLASSIFICATION_SCHEMA,
    [image],
  );
}
