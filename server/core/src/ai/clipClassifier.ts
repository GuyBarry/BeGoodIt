import sharp from 'sharp';
import type { ClothingClassification } from './classifyClothingItem';

// Loaded once; subsequent calls reuse the cached model from disk
let _clf: any = null;

async function getClassifier() {
  if (!_clf) {
    const { pipeline } = await import('@xenova/transformers');
    _clf = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32');
  }
  return _clf;
}

// Clothing-specific prompt phrasing so the model focuses on the garment type,
// not on prints, patterns, or decorative elements within the image.
const CATEGORY_PROMPTS: [ClothingClassification['category'], string][] = [
  ['Top',          'a photo of a clothing top: shirt, blouse, sweater, hoodie, or t-shirt'],
  ['Bottom',       'a photo of clothing bottoms: pants, jeans, skirt, shorts, or trousers'],
  ['Dress',        'a photo of a dress, gown, jumpsuit, or romper'],
  ['Shoes',        'a photo of footwear: shoes, sneakers, boots, sandals, or heels'],
  ['Outerwear',    'a photo of outerwear: jacket, coat, blazer, parka, or windbreaker'],
  ['Accessories',  'a photo of a fashion accessory: bag, hat, belt, sunglasses, scarf, or jewelry'],
  ['Undergarment', 'a photo of underwear, bra, or undergarment'],
  ['Activewear',   'a photo of activewear: sportswear, gym clothes, yoga wear, or athletic clothing'],
];

const SEASON_PROMPTS: [ClothingClassification['season'], string][] = [
  ['Spring',      'lightweight clothing for mild spring weather'],
  ['Summer',      'light clothing for hot summer weather, thin breathable fabric'],
  ['Fall',        'clothing for cool autumn fall weather'],
  ['Winter',      'heavy clothing for cold winter, thick insulating fabric'],
  ['All-Season',  'versatile basic clothing suitable for any season'],
];

const STYLE_PROMPTS: [ClothingClassification['style'], string][] = [
  ['Casual',       'casual everyday relaxed clothing'],
  ['Formal',       'formal professional business attire, dress shirt, or suit'],
  ['Smart Casual', 'smart casual polished yet relaxed clothing'],
  ['Sporty',       'sporty athletic active casual clothing'],
  ['Bohemian',     'bohemian boho free-spirited artistic clothing'],
];

// RGB centroids for pixel-vote color detection.
// After background removal only garment pixels remain, so counting nearest-centroid
// votes correctly identifies the dominant garment color even when the item has prints.
const COLOR_CENTROIDS: [ClothingClassification['colorGroup'], number, number, number][] = [
  ['Black',  20,  20,  20],
  ['White',  240, 240, 240],
  ['Gray',   128, 128, 128],
  ['Red',    210, 30,  30],
  ['Blue',   30,  80,  200],
  ['Green',  34,  130, 34],
  ['Yellow', 240, 210, 0],
  ['Orange', 240, 120, 0],
  ['Purple', 130, 0,   160],
  ['Pink',   255, 100, 160],
  ['Brown',  140, 80,  30],
  ['Beige',  220, 200, 170],
];

async function pickBestLabel<T extends string>(
  dataUrl: string,
  prompts: [T, string][],
  clf: any,
): Promise<T> {
  const texts = prompts.map(([, text]) => text);
  const results: { label: string; score: number }[] = await clf(dataUrl, texts);
  const idx = texts.indexOf(results[0].label);
  return prompts[idx >= 0 ? idx : 0][0];
}

async function getDominantColor(imageBuffer: Buffer): Promise<ClothingClassification['colorGroup']> {
  const { data } = await sharp(imageBuffer)
    .resize(150, 150, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const votes = new Map<ClothingClassification['colorGroup'], number>(
    COLOR_CENTROIDS.map(([name]) => [name, 0]),
  );

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    
    const r = data[i], g = data[i + 1], b = data[i + 2];
    let minDist = Infinity;
    let best = COLOR_CENTROIDS[0][0];
    
    for (const [name, cr, cg, cb] of COLOR_CENTROIDS) {
      const d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2;
      if (d < minDist) { minDist = d; best = name; }
    }
    votes.set(best, (votes.get(best) ?? 0) + 1);
  }

  return [...votes.entries()].sort(([, a], [, b]) => b - a)[0][0];
}

export async function classifyWithClip(
  imageBuffer: Buffer,
  mimeType: string,
): Promise<Omit<ClothingClassification, 'description'>> {
  const clf = await getClassifier();
  const dataUrl = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;

  const [category, colorGroup, season, style] = await Promise.all([
    pickBestLabel(dataUrl, CATEGORY_PROMPTS, clf),
    getDominantColor(imageBuffer),
    pickBestLabel(dataUrl, SEASON_PROMPTS, clf),
    pickBestLabel(dataUrl, STYLE_PROMPTS, clf),
  ]);

  return { category, colorGroup, season, style };
}
