import { fork, ChildProcess } from 'child_process';
import path from 'path';
import sharp from 'sharp';
import type { ClothingClassification } from './classifyClothingItem';

// ── Worker process management ─────────────────────────────────────────────────
// All ONNX Runtime (CLIP / OWL-ViT) work runs in a child process so it never
// shares the process heap with libvips (sharp). On Windows, the two native
// addons corrupt GLib's type system when co-located in the same process.

const isTs        = __filename.endsWith('.ts');
const WORKER_PATH = path.resolve(__dirname, isTs ? 'clipWorker.ts' : 'clipWorker.js');
const WORKER_ARGV = isTs ? ['-r', 'ts-node/register/transpile-only'] : [];

let _worker: ChildProcess | null = null;
const _pending = new Map<string, { resolve: (v: any) => void; reject: (e: Error) => void }>();

function getWorker(): ChildProcess {
  if (!_worker || _worker.exitCode !== null || _worker.killed) {
    _worker = fork(WORKER_PATH, [], { execArgv: WORKER_ARGV, serialization: 'json' });

    _worker.on('message', (msg: any) => {
      const p = _pending.get(msg.id);
      if (!p) return;
      _pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error));
      else p.resolve(msg);
    });

    _worker.on('exit', (code) => {
      _worker = null;
      for (const [id, p] of _pending) {
        _pending.delete(id);
        p.reject(new Error(`CLIP worker exited (code ${code})`));
      }
    });

    _worker.on('error', (err) => console.error('[clip] worker error:', err));
  }
  return _worker;
}

async function sendToWorker<T>(msg: object): Promise<T> {
  const id = `${Date.now()}${Math.random().toString(36).slice(2)}`;
  return new Promise((resolve, reject) => {
    _pending.set(id, { resolve, reject });
    try {
      getWorker().send({ id, ...msg });
    } catch (err: any) {
      _pending.delete(id);
      reject(err);
    }
  });
}

// ── Shared sharp helper ───────────────────────────────────────────────────────

async function toPixels(imageBuffer: Buffer) {
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return {
    pixels: data.toString('base64'),
    width:  info.width,
    height: info.height,
    channels: info.channels,
  };
}

// ── HSV-based per-pixel color classification ──────────────────────────────────
// RGB Euclidean distance is perceptually inaccurate — dark red maps closer to
// the Brown centroid than the Red one. HSV separates hue from brightness so a
// dark red jacket pixel (low V) still reads as Red, not Brown.

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta > 0) {
    if (max === rn)      h = 60 * (((gn - bn) / delta % 6 + 6) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / delta + 2);
    else                 h = 60 * ((rn - gn) / delta + 4);
  }
  return [h, max > 0 ? delta / max : 0, max]; // H 0-360, S 0-1, V 0-1
}

// Takes pre-computed HSV so the vote loop can reuse it for saturation weighting.
function hsvToGroup(h: number, s: number, v: number): ClothingClassification['colorGroup'] {
  const S = s * 100, V = v * 100;

  if (V < 12) return 'Black';
  // Dark + not clearly colorful: catches near-black warm/cool pixels (S < 55)
  // without pulling saturated darks (dark navy S≈63%, dark brown S≈67%) away from their hue.
  if (V < 22 && S < 55) return 'Black';
  // Dark + nearly achromatic
  if (V < 30 && S < 20) return 'Black';
  // White threshold at 85 (was 76) — prevents light gray from being called White
  if (S < 8) return V > 85 ? 'White' : 'Gray';

  // Beige: warm hue, very desaturated, mid-bright
  if (S < 28 && h >= 15 && h <= 65 && V > 55) return 'Beige';

  // Brown: warm-red to orange hue (H 12-40°), dark or muted.
  // Extended to H > 12 (was 18) to cover tan, camel, and warm reddish-brown shades.
  // Condition widened to V < 72 || S < 60 (was V < 62 || S < 50) to capture bright
  // but desaturated browns like camel. Vivid orange (high S, high V) still falls through.
  if (h > 12 && h <= 40 && (V < 72 || S < 60)) return 'Brown';

  // Pure red zone (H 0-12°) — only reaches here if not swept up by Brown above.
  // S threshold 60 (was 50) — rose/deep-pink (S≈55%) correctly lands on Pink, not Red
  if (h <= 12 || h >= 342) return (S >= 60 && V <= 92) ? 'Red' : 'Pink';
  if (h <= 40)  return 'Orange';
  if (h <= 72)  return 'Yellow';
  if (h <= 165) return 'Green';
  if (h <= 260) return 'Blue';
  if (h <= 305) return 'Purple';
  return 'Pink';
}

export async function getDominantColor(imageBuffer: Buffer): Promise<ClothingClassification['colorGroup']> {
  const { data } = await sharp(imageBuffer)
    .resize(150, 150, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const votes = new Map<ClothingClassification['colorGroup'], number>([
    ['Black', 0], ['White', 0], ['Gray', 0], ['Red', 0], ['Blue', 0],
    ['Green', 0], ['Yellow', 0], ['Orange', 0], ['Purple', 0],
    ['Pink', 0], ['Brown', 0], ['Beige', 0],
  ]);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const [h, s, v] = rgbToHsv(data[i], data[i + 1], data[i + 2]);
    const group = hsvToGroup(h, s, v);
    // Weight by saturation: clearly-colored pixels outweigh gray shadows and edge artifacts.
    votes.set(group, (votes.get(group) ?? 0) + 0.1 + s);
  }

  return [...votes.entries()].sort(([, a], [, b]) => b - a)[0][0];
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function classifyWithClip(
  imageBuffer: Buffer,
): Promise<Omit<ClothingClassification, 'description'>> {
  // Color detection (sharp/main) runs concurrently with CLIP inference (ONNX/worker).
  // Safe because ONNX is in a separate process — no shared heap with libvips.
  const [colorGroup, result] = await Promise.all([
    getDominantColor(imageBuffer),
    toPixels(imageBuffer).then(p => sendToWorker<any>({ type: 'classify', ...p })),
  ]);
  return { category: result.category, colorGroup, season: result.season, style: result.style };
}

export interface RawDetection {
  label: string;
  score: number;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
}

export async function detectClothingItems(imageBuffer: Buffer): Promise<RawDetection[]> {
  const p = await toPixels(imageBuffer);
  const result = await sendToWorker<{ detections: RawDetection[] }>({ type: 'detect', ...p });
  return result.detections ?? [];
}
