// Runs as a child process so ONNX Runtime is isolated from the main process's
// libvips (sharp). The two native addons cannot share a process heap on Windows
// without triggering a GLib VObject assertion crash.
//
// Images arrive as pre-decoded RGBA pixel arrays (base64) via IPC — the worker
// never loads sharp or any other image library.

type Category = 'Top' | 'Bottom' | 'Dress' | 'Shoes' | 'Outerwear' | 'Accessories' | 'Undergarment' | 'Activewear';
type Season   = 'Spring' | 'Summer' | 'Fall' | 'Winter' | 'All-Season';
type Style    = 'Casual' | 'Formal' | 'Smart Casual' | 'Sporty' | 'Bohemian';

const CATEGORY_PROMPTS: [Category, string][] = [
  ['Top',          'a photo of a clothing top: shirt, blouse, sweater, hoodie, or t-shirt'],
  ['Bottom',       'a photo of clothing bottoms: pants, jeans, skirt, shorts, or trousers'],
  ['Dress',        'a photo of a dress, gown, jumpsuit, or romper'],
  ['Shoes',        'a photo of footwear: shoes, sneakers, boots, sandals, or heels'],
  ['Outerwear',    'a photo of outerwear: jacket, coat, blazer, parka, or windbreaker'],
  ['Accessories',  'a photo of a fashion accessory: bag, hat, belt, sunglasses, scarf, or jewelry'],
  ['Undergarment', 'a photo of underwear, bra, or undergarment'],
  ['Activewear',   'a photo of activewear: sportswear, gym clothes, yoga wear, or athletic clothing'],
];

const SEASON_PROMPTS: [Season, string][] = [
  ['Spring',      'lightweight clothing for mild spring weather'],
  ['Summer',      'light clothing for hot summer weather, thin breathable fabric'],
  ['Fall',        'clothing for cool autumn fall weather'],
  ['Winter',      'heavy clothing for cold winter, thick insulating fabric'],
  ['All-Season',  'versatile basic clothing suitable for any season'],
];

const STYLE_PROMPTS: [Style, string][] = [
  ['Casual',       'casual everyday relaxed clothing'],
  ['Formal',       'formal professional business attire, dress shirt, or suit'],
  ['Smart Casual', 'smart casual polished yet relaxed clothing'],
  ['Sporty',       'sporty athletic active casual clothing'],
  ['Bohemian',     'bohemian boho free-spirited artistic clothing'],
];

// Text queries sent to Grounding DINO — one per clothing category.
// Using a closed list of prompts keeps detections scoped to garments only.
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
const DETECTION_THRESHOLD = 0.1;

let _clf: any      = null;
let _detector: any = null;
let _RawImage: any = null;

async function ensureClip() {
  if (_clf) return;
  const mod: any = await import('@xenova/transformers');
  _RawImage = mod.RawImage;
  _clf = await mod.pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32');
}

async function ensureDetector() {
  if (_detector) return;
  const mod: any = await import('@xenova/transformers');
  _RawImage = _RawImage ?? mod.RawImage;
  _detector = await mod.pipeline('zero-shot-object-detection', 'Xenova/grounding-dino-tiny');
}

function makeImage(pixels: string, width: number, height: number, channels: number): any {
  return new _RawImage(new Uint8ClampedArray(Buffer.from(pixels, 'base64')), width, height, channels);
}

async function pickBest<T extends string>(image: any, prompts: [T, string][]): Promise<T> {
  const texts = prompts.map(([, t]) => t);
  const results: { label: string; score: number }[] = await _clf(image, texts);
  const idx = texts.indexOf(results[0].label);
  return prompts[idx >= 0 ? idx : 0][0];
}

// ── Sequential message queue — ONNX inference is not safe to interleave ───────

interface WorkerMsg {
  id: string;
  type: 'classify' | 'detect';
  pixels: string;
  width: number;
  height: number;
  channels: number;
}

const queue: WorkerMsg[] = [];
let running = false;

async function processNext() {
  if (running || queue.length === 0) return;
  running = true;
  const msg = queue.shift()!;

  try {
    const { id, type, pixels, width, height, channels } = msg;

    if (type === 'classify') {
      await ensureClip();
      const image = makeImage(pixels, width, height, channels);
      const [category, season, style] = await Promise.all([
        pickBest(image, CATEGORY_PROMPTS),
        pickBest(image, SEASON_PROMPTS),
        pickBest(image, STYLE_PROMPTS),
      ]);
      process.send!({ id, category, season, style });

    } else if (type === 'detect') {
      await ensureDetector();
      const image = makeImage(pixels, width, height, channels);
      const detections: unknown[] = await _detector(image, DETECTION_QUERIES, { threshold: DETECTION_THRESHOLD });
      process.send!({ id, detections });
    }
  } catch (err: any) {
    process.send!({ id: msg.id, error: String(err?.message ?? err) });
  }

  running = false;
  processNext();
}

process.on('message', (msg: WorkerMsg) => {
  queue.push(msg);
  processNext();
});

// Pre-warm CLIP so the first real request isn't slow
ensureClip().catch(err => console.error('[clip-worker] init error:', err));
