import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteerExtra.use(StealthPlugin());

import { BadRequestException, BotProtectedException } from '../exceptions/httpExceptions';
import { classifyClothingItem, ClothingClassification } from '../ai/classifyClothingItem';
import { clothingItemRepository, smartBuyTestRepository } from '../repositories';
import { imagesService } from './images.service';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];

const isBlockedResponse = (html: string, status: number): boolean => {
  if (status === 403 || status === 429 || status === 503) return true;
  return (
    html.includes('bm-verify') ||
    html.includes('cf-browser-verification') ||
    html.includes('Access Denied') ||
    html.includes('_sec/verify') ||
    html.includes('interstitial')
  );
};

const extractMeta = (html: string): { imageUrl: string | null; title: string } => {
  const imageUrl =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)?.[1] ??
    html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i)?.[1] ??
    null;

  const title = (
    html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"'<>]+)["']/i)?.[1] ??
    html.match(/<meta[^>]+content=["']([^"'<>]+)["'][^>]+property=["']og:title["']/i)?.[1] ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ??
    ''
  ).trim();

  return { imageUrl, title };
};

const fetchHtmlWithPuppeteer = async (pageUrl: string): Promise<string> => {
  const browser = await puppeteerExtra.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 20000 });
    return await page.content();
  } finally {
    await browser.close();
  }
};

const downloadImage = async (imageUrl: string, referer: string): Promise<{ data: Buffer; mimeType: string }> => {
  let imgRes: Response;
  try {
    imgRes = await fetch(imageUrl, {
      headers: { ...BROWSER_HEADERS, Referer: referer },
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    throw new BadRequestException('Found the product image but could not download it. Try uploading directly.');
  }
  const mimeType = imgRes.headers.get('content-type') ?? 'image/jpeg';
  const data = Buffer.from(await imgRes.arrayBuffer());
  return { data, mimeType };
};

export interface ProductMeta {
  category: string | null;
  season: string | null;
}

// ── Compatibility scoring ────────────────────────────────────────────────────

const CATEGORY_MATRIX: Record<string, Record<string, number>> = {
  Top:          { Bottom: 95, Shoes: 80, Outerwear: 85, Accessories: 70, Dress: 10, Top: 20, Activewear: 30, Undergarment: 10 },
  Bottom:       { Top: 95, Shoes: 85, Outerwear: 80, Accessories: 65, Dress: 10, Bottom: 20, Activewear: 30, Undergarment: 10 },
  Dress:        { Shoes: 90, Accessories: 80, Outerwear: 75, Dress: 20, Top: 10, Bottom: 10, Activewear: 10, Undergarment: 10 },
  Shoes:        { Top: 80, Bottom: 85, Dress: 90, Outerwear: 70, Accessories: 65, Shoes: 20, Activewear: 40, Undergarment: 10 },
  Outerwear:    { Top: 85, Bottom: 80, Dress: 75, Shoes: 70, Accessories: 65, Outerwear: 30, Activewear: 30, Undergarment: 10 },
  Accessories:  { Top: 70, Bottom: 65, Dress: 80, Shoes: 65, Outerwear: 65, Accessories: 60, Activewear: 60, Undergarment: 10 },
  Activewear:   { Activewear: 85, Shoes: 75, Accessories: 60, Top: 30, Bottom: 30, Outerwear: 40, Dress: 10, Undergarment: 10 },
  Undergarment: { Top: 10, Bottom: 10, Dress: 10, Shoes: 10, Outerwear: 10, Accessories: 10, Activewear: 10, Undergarment: 50 },
};

const NEUTRALS = new Set(['Black', 'White', 'Gray', 'Beige', 'Brown']);
const COMPLEMENTARY: [string, string][] = [
  ['Blue', 'Orange'], ['Red', 'Green'], ['Yellow', 'Purple'], ['Pink', 'Green'],
];

const colorScore = (a: string, b: string): number => {
  if (a === b) return 55;
  const na = NEUTRALS.has(a), nb = NEUTRALS.has(b);
  if (na && nb) return 80;
  if (na || nb) return 85;
  if (COMPLEMENTARY.some(([x, y]) => (a === x && b === y) || (a === y && b === x))) return 80;
  return 60;
};

const seasonScore = (a: string, b: string): number => {
  if (a === b) return 90;
  if (a === 'All-Season' || b === 'All-Season') return 85;
  return 35;
};

const styleScore = (a: string, b: string): number => {
  if (a === b) return 90;
  if (
    (a === 'Casual' && b === 'Smart Casual') || (a === 'Smart Casual' && b === 'Casual') ||
    (a === 'Formal' && b === 'Smart Casual') || (a === 'Smart Casual' && b === 'Formal')
  ) return 70;
  return 40;
};

const scoreItem = (
  uploaded: ClothingClassification,
  item: { category: string | null; colorGroup: string | null; season: string | null; style: string | null },
): number => {
  let total = 0, weight = 0;
  if (item.category) { total += (CATEGORY_MATRIX[uploaded.category]?.[item.category] ?? 50) * 40; weight += 40; }
  if (item.colorGroup) { total += colorScore(uploaded.colorGroup, item.colorGroup) * 30; weight += 30; }
  if (item.season) { total += seasonScore(uploaded.season, item.season) * 15; weight += 15; }
  if (item.style) { total += styleScore(uploaded.style, item.style) * 15; weight += 15; }
  return weight === 0 ? 65 : Math.round(total / weight);
};

export interface SmartBuyMatch { itemId: string; compatibilityPct: number; }

export interface SmartBuyAnalysisResult {
  uploadedClassification: ClothingClassification;
  suggestedName: string;
  matches: SmartBuyMatch[];
  compatibilityPct: number;
  outfitCount: number;
}

export const smartBuyService = {
  async fetchProductImage(pageUrl: string): Promise<{ data: Buffer; mimeType: string; title: string; meta: ProductMeta }> {
    // 1. Quick check: maybe the user pasted a direct image URL
    let res: Response;
    try {
      res = await fetch(pageUrl, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(12000),
      });
    } catch {
      throw new BadRequestException('Could not reach that URL. Check the link and try again.');
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (IMAGE_MIME_TYPES.some(t => contentType.includes(t))) {
      const data = Buffer.from(await res.arrayBuffer());
      return { data, mimeType: contentType.split(';')[0], title: '', meta: { category: null, season: null } };
    }

    let html = await res.text();

    // 2. Bot protection detected — retry with Puppeteer + stealth
    if (isBlockedResponse(html, res.status)) {
      console.log('[SmartBuy] Bot protection detected, retrying with Puppeteer...');
      try {
        html = await fetchHtmlWithPuppeteer(pageUrl);
      } catch {
        throw new BotProtectedException();
      }
    } else if (!res.ok) {
      throw new BadRequestException(`The page returned ${res.status}. Try a different link.`);
    }

    const { imageUrl, title } = extractMeta(html);
    if (!imageUrl) {
      throw new BadRequestException('No product image found on this page. Try uploading the image directly.');
    }

    const resolvedUrl = imageUrl.startsWith('http') ? imageUrl : new URL(imageUrl, pageUrl).toString();
    const { data, mimeType } = await downloadImage(resolvedUrl, new URL(pageUrl).origin);

    return { data, mimeType, title, meta: { category: null, season: null } };
  },

  async analyzeCompatibility(
    file: Express.Multer.File,
    userId: string,
    productTitle?: string,
  ): Promise<SmartBuyAnalysisResult> {
    const [uploadedClassification, { items: closetItems }] = await Promise.all([
      classifyClothingItem({ mimeType: file.mimetype, data: file.buffer }, productTitle),
      clothingItemRepository.getFilteredByUserId(userId, {}, 1, 1000),
    ]);

    const scored = closetItems
      .map(item => ({
        itemId: item.id,
        compatibilityPct: scoreItem(uploadedClassification, {
          category: item.category?.name ?? null,
          colorGroup: item.colorGroup?.name ?? null,
          season: item.season?.name ?? null,
          style: item.style ?? null,
        }),
      }))
      .sort((a, b) => b.compatibilityPct - a.compatibilityPct);

    const top = scored.slice(0, 8);
    const compatibilityPct = top.length
      ? Math.round(top.slice(0, 3).reduce((s, m) => s + m.compatibilityPct, 0) / Math.min(top.length, 3))
      : 0;
    const outfitCount = scored.filter(m => m.compatibilityPct >= 70).length;

    const suggestedName = [uploadedClassification.colorGroup, uploadedClassification.style, uploadedClassification.category]
      .filter(Boolean).join(' ');

    return { uploadedClassification, suggestedName, matches: top, compatibilityPct, outfitCount };
  },

  async saveTest(
    userId: string,
    file: Express.Multer.File | null,
    data: {
      name: string;
      compatibilityPct: number;
      matchCount: number;
      outfitCount: number;
      matchedItems: { itemId: string; matchPct: number }[];
      classification: { category: string; colorGroup: string; season: string; style: string } | null;
    },
  ) {
    let imageId: string | null = null;
    if (file) {
      const saved = await imagesService.saveImage(file);
      imageId = saved.id;
    }

    await smartBuyTestRepository.pruneOldTests(userId);

    const test = smartBuyTestRepository.create({
      userId,
      imageId,
      name: data.name,
      compatibilityPct: data.compatibilityPct,
      matchCount: data.matchCount,
      outfitCount: data.outfitCount,
      matchedItems: data.matchedItems,
      classification: data.classification,
    });

    return smartBuyTestRepository.save(test);
  },

  async getUserTests(userId: string) {
    return smartBuyTestRepository.getByUserId(userId);
  },
};
