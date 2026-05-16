import { Type } from '@google/genai';
import { AIImageInput, AIModel, generateNewItemClassificationInput } from './ai.provider';

export interface ClothingClassification {
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear' | 'Accessories' | 'Undergarment' | 'Activewear';
  colorGroup: 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Orange' | 'Purple' | 'Pink' | 'Brown' | 'Gray' | 'Beige';
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  style: 'Casual' | 'Formal' | 'Smart Casual' | 'Sporty' | 'Bohemian';
}

const CLASSIFICATION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
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
  },
  required: ['category', 'colorGroup', 'season', 'style'],
};

const BASE_PROMPT = `Analyze this clothing item image and classify it using only the exact values listed below.

- category: pick exactly one of: Top, Bottom, Dress, Shoes, Outerwear, Accessories, Undergarment, Activewear
- colorGroup: pick exactly one of: Black, White, Red, Blue, Green, Yellow, Orange, Purple, Pink, Brown, Gray, Beige
- season: pick exactly one of: Spring, Summer, Fall, Winter, All-Season
  (base on fabric weight — lightweight → Spring/Summer, heavy/insulating → Fall/Winter, only use All-Season for genuine basics like plain tees or jeans)
- style: pick exactly one of: Casual, Formal, Smart Casual, Sporty, Bohemian`;

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
