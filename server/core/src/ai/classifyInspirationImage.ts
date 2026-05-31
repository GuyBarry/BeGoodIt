import sharp from 'sharp';
import { AIImageInput } from './ai.provider';
import { classifyWithClip, toRawImage } from './clipClassifier';

export interface InspirationItem {
  category: 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear' | 'Accessories' | 'Undergarment' | 'Activewear';
  colorGroup: 'Black' | 'White' | 'Red' | 'Blue' | 'Green' | 'Yellow' | 'Orange' | 'Purple' | 'Pink' | 'Brown' | 'Gray' | 'Beige';
  season: 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
  style: 'Casual' | 'Formal' | 'Smart Casual' | 'Sporty' | 'Bohemian';
  description: string;
}

// OWL-ViT zero-shot object detector — finds where clothing items are in an outfit photo.
// Loaded once and reused across requests.
let _detector: any = null;

async function getDetector() {
  if (!_detector) {
    const { pipeline } = await import('@xenova/transformers');
    _detector = await pipeline('zero-shot-object-detection', 'Xenova/owlvit-base-patch32');
  }
  return _detector;
}

// One query per clothing category — OWL-ViT uses these to locate items in the photo.
// Category is determined by CLIP after cropping (more accurate on isolated crops),
// so these labels are only used for detection, not for the final classification.
const DETECTION_QUERIES = [
  'a shirt, blouse, sweater, hoodie, or t-shirt',
  'pants, jeans, skirt, or shorts',
  'a dress, jumpsuit, or romper',
  'shoes, sneakers, boots, or sandals',
  'a jacket, coat, blazer, or outerwear',
  'a bag, hat, belt, scarf, or sunglasses',
  'underwear or a bra',
  'sportswear or gym clothes',
];

const DETECTION_THRESHOLD = 0.05;
const IOU_THRESHOLD = 0.5;

interface Box { xmin: number; ymin: number; xmax: number; ymax: number; }
interface Detection { score: number; box: Box; }

function iou(a: Box, b: Box): number {
  const ix1 = Math.max(a.xmin, b.xmin), iy1 = Math.max(a.ymin, b.ymin);
  const ix2 = Math.min(a.xmax, b.xmax), iy2 = Math.min(a.ymax, b.ymax);
  const inter = Math.max(0, ix2 - ix1) * Math.max(0, iy2 - iy1);
  if (inter === 0) return 0;
  return inter / ((a.xmax - a.xmin) * (a.ymax - a.ymin) + (b.xmax - b.xmin) * (b.ymax - b.ymin) - inter);
}

function suppressOverlapping(dets: Detection[]): Detection[] {
  const sorted = [...dets].sort((a, b) => b.score - a.score);
  const kept: Detection[] = [];
  for (const d of sorted) {
    if (kept.every(k => iou(k.box, d.box) < IOU_THRESHOLD)) kept.push(d);
  }
  return kept;
}

async function cropToBox(buffer: Buffer, box: Box): Promise<Buffer> {
  const { width = 1, height = 1 } = await sharp(buffer).metadata();
  const left   = Math.max(0, Math.round(box.xmin));
  const top    = Math.max(0, Math.round(box.ymin));
  const right  = Math.min(width,  Math.round(box.xmax));
  const bottom = Math.min(height, Math.round(box.ymax));
  return sharp(buffer)
    .extract({ left, top, width: right - left, height: bottom - top })
    .png()
    .toBuffer();
}

export async function classifyInspirationImage(image: AIImageInput): Promise<InspirationItem[]> {
  const [detector, rawImage] = await Promise.all([
    getDetector(),
    toRawImage(image.data),
  ]);

  const raw: { label: string; score: number; box: Box }[] =
    await detector(rawImage, DETECTION_QUERIES, { threshold: DETECTION_THRESHOLD });

  const detections = suppressOverlapping(raw.map(r => ({ score: r.score, box: r.box })));
  if (detections.length === 0) return [];

  return Promise.all(
    detections.map(async (det) => {
      const crop = await cropToBox(image.data, det.box);
      // CLIP classifies all 4 fields on the isolated crop — same path as single-item upload
      const { category, colorGroup, season, style } = await classifyWithClip(crop);
      const seasonLabel = season === 'All-Season' ? 'all seasons' : `the ${season.toLowerCase()} season`;
      const description = `A ${colorGroup.toLowerCase()} ${category.toLowerCase()} suited for ${seasonLabel} with a ${style.toLowerCase()} style.`;
      return { category, colorGroup, season, style, description };
    }),
  );
}
