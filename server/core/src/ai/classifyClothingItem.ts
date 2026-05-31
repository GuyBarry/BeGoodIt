import { AIImageInput } from './ai.provider';
import { classifyWithClip } from './clipClassifier';

export interface ClothingClassification {
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear' | 'Accessories' | 'Undergarment' | 'Activewear';
  colorGroup: 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Orange' | 'Purple' | 'Pink' | 'Brown' | 'Gray' | 'Beige';
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  style: 'Casual' | 'Formal' | 'Smart Casual' | 'Sporty' | 'Bohemian';
  description: string;
}

// Keyword-based category derivation from a product title — used as a hard override
// when the caller knows the item type from its name (e.g. "Blue Bird Print Sweater").
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
  const clip = await classifyWithClip(image.data);

  const category = productTitle
    ? (deriveCategory(productTitle) ?? clip.category)
    : clip.category;

  const { colorGroup, season, style } = clip;
  const seasonLabel = season === 'All-Season' ? 'all seasons' : `the ${season.toLowerCase()} season`;
  const description = `A ${colorGroup.toLowerCase()} ${category.toLowerCase()} suited for ${seasonLabel} with a ${style.toLowerCase()} style.`;

  return { category, colorGroup, season, style, description };
}
