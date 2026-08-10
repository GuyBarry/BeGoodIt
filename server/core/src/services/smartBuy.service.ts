import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteerExtra.use(StealthPlugin());

import { BadRequestException, BotProtectedException } from '../exceptions/httpExceptions';
import { classifyClothingItem, ClothingClassification } from '../ai/classifyClothingItem';
import { generateEmbedding } from '../ai/ai.provider';
import { clothingItemRepository, smartBuyTestRepository } from '../repositories';
import { imagesService } from './images.service';
import { bufferToFloats, EMBEDDING_BYTES } from './clothingItem.service';
import { cosineSimilarity } from './inspirationMatching.service';

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

// Attribute values are captured via a backreference to whichever quote char
// actually opened them ((["']) ... \1), instead of excluding both " and '
// outright. Titles routinely contain an apostrophe that has nothing to do
// with the attribute delimiter — e.g. Hebrew ג'ינס ("jeans"), or "Men's
// Jeans" — and excluding ' unconditionally truncated the match at that
// character, e.g. content="ג'ינס SLIM CROPPED" used to yield just "ג".
const ATTR = '(["\'])((?:(?!\\1)[\\s\\S])*)\\1';

const extractMeta = (html: string): { imageUrl: string | null; title: string } => {
  const imageUrl =
    html.match(new RegExp(`<meta[^>]+property=["']og:image["'][^>]+content=${ATTR}`, 'i'))?.[2] ??
    html.match(new RegExp(`<meta[^>]+content=${ATTR}[^>]+property=["']og:image["']`, 'i'))?.[2] ??
    html.match(new RegExp(`<meta[^>]+name=["']twitter:image["'][^>]+content=${ATTR}`, 'i'))?.[2] ??
    html.match(new RegExp(`<meta[^>]+content=${ATTR}[^>]+name=["']twitter:image["']`, 'i'))?.[2] ??
    null;

  const title = (
    html.match(new RegExp(`<meta[^>]+property=["']og:title["'][^>]+content=${ATTR}`, 'i'))?.[2] ??
    html.match(new RegExp(`<meta[^>]+content=${ATTR}[^>]+property=["']og:title["']`, 'i'))?.[2] ??
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
    // Many retailer PDPs (Zara included) are client-rendered SPAs: the
    // server-sent HTML only has generic/placeholder <meta> tags (og:image,
    // title) until the page's own JS fetches the product data and rewrites
    // them. `domcontentloaded` fires before that happens, so we'd scrape the
    // site's default share image instead of this specific product's photo.
    // `networkidle2` waits for the page's data-fetching to settle first.
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 25000 });
    // Small grace period for SPAs that update meta tags just after the last
    // network request resolves rather than synchronously with it.
    await new Promise(resolve => setTimeout(resolve, 1000));
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

// Values are the empirical co-occurrence score(A -> B) = P(B in outfit | A in
// outfit) x 100, derived from 16,990 outfits in the Maryland Polyvore dataset
// (Han et al., ACM MM'17). Note the matrix is asymmetric by construction, and
// the Undergarment/Activewear rows rest on comparatively few outfits (391/171).
const CATEGORY_MATRIX: Record<string, Record<string, number>> = {
  Top:          { Bottom: 90, Shoes: 94, Outerwear: 36, Accessories: 93, Dress: 3, Top: 10, Activewear: 1, Undergarment: 2 },
  Bottom:       { Top: 91, Shoes: 94, Outerwear: 39, Accessories: 93, Dress: 2, Bottom: 2, Activewear: 1, Undergarment: 2 },
  Dress:        { Shoes: 95, Accessories: 96, Outerwear: 33, Dress: 5, Top: 8, Bottom: 4, Activewear: 1, Undergarment: 1 },
  Shoes:        { Top: 69, Bottom: 69, Dress: 25, Outerwear: 37, Accessories: 94, Shoes: 5, Activewear: 1, Undergarment: 2 },
  Outerwear:    { Top: 69, Bottom: 72, Dress: 22, Shoes: 95, Accessories: 94, Outerwear: 3, Activewear: 1, Undergarment: 2 },
  Accessories:  { Top: 68, Bottom: 67, Dress: 25, Shoes: 93, Outerwear: 36, Accessories: 74, Activewear: 1, Undergarment: 2 },
  Activewear:   { Activewear: 12, Shoes: 80, Accessories: 78, Top: 67, Bottom: 24, Outerwear: 19, Dress: 1, Undergarment: 5 },
  Undergarment: { Top: 51, Bottom: 69, Dress: 15, Shoes: 86, Outerwear: 33, Accessories: 90, Activewear: 2, Undergarment: 18 },
};

// Values are the empirical co-occurrence score(A -> B) = P(B in outfit | A in
// outfit), derived from the same 16,990 Polyvore outfits as CATEGORY_MATRIX.
const COLOR_MATRIX: Record<string, Record<string, number>> = {
  Black:  { Black: 79, White: 72, Red: 63, Blue: 63, Green: 58, Yellow: 57, Orange: 56, Purple: 55, Pink: 65, Brown: 60, Gray: 59, Beige: 59 },
  White:  { Black: 85, White: 66, Red: 62, Blue: 67, Green: 59, Yellow: 57, Orange: 56, Purple: 55, Pink: 67, Brown: 60, Gray: 59, Beige: 59 },
  Red:    { Black: 85, White: 69, Red: 66, Blue: 63, Green: 57, Yellow: 56, Orange: 58, Purple: 56, Pink: 66, Brown: 61, Gray: 58, Beige: 59 },
  Blue:   { Black: 78, White: 73, Red: 61, Blue: 65, Green: 59, Yellow: 57, Orange: 57, Purple: 56, Pink: 67, Brown: 59, Gray: 59, Beige: 59 },
  Green:  { Black: 82, White: 71, Red: 60, Blue: 67, Green: 64, Yellow: 58, Orange: 57, Purple: 55, Pink: 65, Brown: 60, Gray: 59, Beige: 61 },
  Yellow: { Black: 82, White: 69, Red: 61, Blue: 65, Green: 59, Yellow: 63, Orange: 59, Purple: 56, Pink: 64, Brown: 59, Gray: 57, Beige: 60 },
  Orange: { Black: 78, White: 69, Red: 64, Blue: 65, Green: 58, Yellow: 59, Orange: 63, Purple: 56, Pink: 73, Brown: 62, Gray: 58, Beige: 63 },
  Purple: { Black: 81, White: 70, Red: 63, Blue: 70, Green: 59, Yellow: 58, Orange: 58, Purple: 61, Pink: 72, Brown: 59, Gray: 59, Beige: 58 },
  Pink:   { Black: 79, White: 71, Red: 62, Blue: 65, Green: 58, Yellow: 56, Orange: 59, Purple: 56, Pink: 69, Brown: 60, Gray: 58, Beige: 62 },
  Brown:  { Black: 81, White: 70, Red: 62, Blue: 65, Green: 58, Yellow: 56, Orange: 58, Purple: 55, Pink: 67, Brown: 62, Gray: 58, Beige: 65 },
  Gray:   { Black: 85, White: 72, Red: 61, Blue: 66, Green: 59, Yellow: 56, Orange: 56, Purple: 56, Pink: 65, Brown: 59, Gray: 61, Beige: 59 },
  Beige:  { Black: 77, White: 67, Red: 60, Blue: 64, Green: 59, Yellow: 57, Orange: 59, Purple: 55, Pink: 68, Brown: 65, Gray: 58, Beige: 61 },
};

const colorScore = (a: string, b: string): number => COLOR_MATRIX[a]?.[b] ?? 60;

const SEASON_CYCLE = ['Winter', 'Spring', 'Summer', 'Fall'];

const seasonScore = (a: string, b: string): number => {
  if (a === b) return 90;
  if (a === 'All-Season' || b === 'All-Season') return 85;
  const ia = SEASON_CYCLE.indexOf(a), ib = SEASON_CYCLE.indexOf(b);
  if (ia === -1 || ib === -1) return 35;
  const dist = Math.min(Math.abs(ia - ib), SEASON_CYCLE.length - Math.abs(ia - ib));
  return dist === 1 ? 65 : 30; // calendar-adjacent (transitional) vs. opposite
};

const STYLE_MATRIX: Record<string, Record<string, number>> = {
  Casual:         { Casual: 90, Formal: 40, 'Smart Casual': 70, Sporty: 75, Bohemian: 75 },
  Formal:         { Casual: 40, Formal: 90, 'Smart Casual': 70, Sporty: 20, Bohemian: 25 },
  'Smart Casual': { Casual: 70, Formal: 70, 'Smart Casual': 90, Sporty: 45, Bohemian: 45 },
  Sporty:         { Casual: 75, Formal: 20, 'Smart Casual': 45, Sporty: 90, Bohemian: 35 },
  Bohemian:       { Casual: 75, Formal: 25, 'Smart Casual': 45, Sporty: 35, Bohemian: 90 },
};

const styleScore = (a: string, b: string): number => STYLE_MATRIX[a]?.[b] ?? 40;

// How much a same/adjacent-category match (e.g. Top vs Top) is allowed to climb
// above its base category score on the strength of color/style/embedding
// similarity alone. Without this, a near-duplicate of something already in the
// closet — same category, same color, same everything — scores artificially
// high just because it looks like a great match on paper, when in reality it's
// simply redundant with an item the user already owns.
const CATEGORY_SCORE_HEADROOM = 25;

const scoreItem = (
  uploaded: ClothingClassification,
  uploadedEmbedding: number[] | null,
  item: { category: string | null; colorGroups: string[]; seasons: string[]; styles: string[]; imageEmbedding: Buffer | null },
): number => {
  const categoryPct = item.category ? (CATEGORY_MATRIX[uploaded.category]?.[item.category] ?? 50) : 50;

  let total = 0, weight = 0;
  if (item.category) { total += categoryPct * 40; weight += 40; }
  if (item.colorGroups.length && uploaded.colorGroups.length) {
    total += Math.max(...uploaded.colorGroups.flatMap(a => item.colorGroups.map(b => colorScore(a, b)))) * 30;
    weight += 30;
  }
  if (item.seasons.length && uploaded.seasons.length) {
    total += Math.max(...uploaded.seasons.flatMap(a => item.seasons.map(b => seasonScore(a, b)))) * 15;
    weight += 15;
  }
  if (item.styles.length && uploaded.styles.length) {
    total += Math.max(...uploaded.styles.flatMap(a => item.styles.map(b => styleScore(a, b)))) * 15;
    weight += 15;
  }
  const metadataScore = weight === 0 ? 65 : Math.round(total / weight);

  let score = metadataScore;
  if (uploadedEmbedding && item.imageEmbedding?.length === EMBEDDING_BYTES) {
    const embeddingScore = Math.round(cosineSimilarity(uploadedEmbedding, bufferToFloats(item.imageEmbedding)) * 100);
    const blend = Math.round(0.7 * metadataScore + 0.3 * embeddingScore);
    // The embedding compares AI-written text descriptions, not "would these
    // look good together" — two genuinely different but well-paired items
    // (e.g. a top and its ideal bottom) rarely have near-identical
    // descriptions, so a weak embedding shouldn't undercut a metadata score
    // the curated rules already earned. Let it boost, never drag down.
    score = Math.max(blend, metadataScore);
  }

  // Category fit is a hard ceiling, not just one input among several: two items
  // the curated matrix says don't pair well can't out-score that via color,
  // style, or visual/textual similarity alone.
  return Math.min(score, categoryPct + CATEGORY_SCORE_HEADROOM);
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
      // Puppeteer can still land on the site's block/challenge page (Akamai,
      // Cloudflare, etc.) rather than the real product. Re-check the rendered
      // HTML so we surface an accurate "this site blocks automated access"
      // message instead of falling through to a misleading "no image" error.
      if (isBlockedResponse(html, 200)) {
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

    const uploadedEmbedding = await generateEmbedding(uploadedClassification.description).catch(() => null);

    const scored = closetItems
      // Same-category items (e.g. a top vs. the tops already in the closet) aren't
      // outfit "matches" — you don't pair two tops together — so they shouldn't
      // show up as a best match no matter how similar the color/style/embedding.
      .filter(item => item.category?.name !== uploadedClassification.category)
      .map(item => ({
        itemId: item.id,
        compatibilityPct: scoreItem(uploadedClassification, uploadedEmbedding, {
          category: item.category?.name ?? null,
          colorGroups: (item.colorGroups ?? []).map(cg => cg.name),
          seasons: (item.seasons ?? []).map(s => s.name),
          styles: (item.styles ?? []).map(s => s.name),
          imageEmbedding: item.imageEmbedding ?? null,
        }),
      }))
      .sort((a, b) => b.compatibilityPct - a.compatibilityPct);

    const top = scored.slice(0, 8);
    const compatibilityPct = top.length
      ? Math.round(top.slice(0, 3).reduce((s, m) => s + m.compatibilityPct, 0) / Math.min(top.length, 3))
      : 0;
    const outfitCount = scored.filter(m => m.compatibilityPct >= 70).length;

    const suggestedName = [uploadedClassification.colorGroups[0], uploadedClassification.styles[0], uploadedClassification.category]
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
      classification: { category: string; colorGroups: string[]; seasons: string[]; styles: string[] } | null;
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
