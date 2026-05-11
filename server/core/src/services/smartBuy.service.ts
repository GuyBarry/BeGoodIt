import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
puppeteerExtra.use(StealthPlugin());

import { BadRequestException, BotProtectedException } from '../exceptions/httpExceptions';

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
};
