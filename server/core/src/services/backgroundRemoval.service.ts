import { exec } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import sharp from 'sharp';

class BackgroundRemovalService {
  async removeBackground(file: Express.Multer.File): Promise<Express.Multer.File> {
    const tmpDir = os.tmpdir();
    const uid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const inputPath = path.join(tmpDir, `rembg_input_${uid}.png`);
    const outputPath = path.join(tmpDir, `rembg_output_${uid}.png`);

    try {
      const pngBuffer = await sharp(file.buffer).png().toBuffer();
      fs.writeFileSync(inputPath, pngBuffer);

      await this.runRembg(inputPath, outputPath);

      const outputBuffer = fs.readFileSync(outputPath);

      return {
        ...file,
        buffer: outputBuffer,
        mimetype: 'image/png',
        originalname: this.toNoBgFilename(file.originalname),
        size: outputBuffer.length,
      };
    } finally {
      this.safeUnlink(inputPath);
      this.safeUnlink(outputPath);
    }
  }

  private runRembg(inputPath: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      exec(`rembg i "${inputPath}" "${outputPath}"`, (error, _stdout, stderr) => {
        if (error) {
          reject(new Error(`rembg failed: ${stderr || error.message}`));
        } else {
          resolve();
        }
      });
    });
  }

  private toNoBgFilename(originalname: string): string {
    const ext = path.extname(originalname);
    const base = path.basename(originalname, ext);
    return `${base}_no_bg.png`;
  }

  private safeUnlink(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch {
      // Ignore cleanup errors
    }
  }
}

export const backgroundRemovalService = new BackgroundRemovalService();
