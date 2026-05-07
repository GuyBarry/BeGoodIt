import { removeBackground as rembg } from "@imgly/background-removal-node";
import sharp from "sharp";

const buildProcessedFile = (
  original: Express.Multer.File,
  buffer: Buffer,
  mimetype: string,
  suffix: string,
): Express.Multer.File => ({
  ...original,
  buffer,
  mimetype,
  originalname: original.originalname.replace(/\.[^/.]+$/, suffix),
  size: buffer.length,
});

const removeBackground = async (
  file: Express.Multer.File,
  applyWhiteBackground: boolean = false,
): Promise<Express.Multer.File> => {
  try {
    const normalizedBuffer = await sharp(file.buffer)
      .png()
      .toBuffer();

    const inputBlob = new Blob([normalizedBuffer], { type: 'image/png' });

    const outputImage = await rembg(inputBlob);

    const arrayBuffer = await outputImage.arrayBuffer();
    const transparentPngBuffer = Buffer.from(arrayBuffer);

    if (applyWhiteBackground) {
      const finalBuffer = await sharp(transparentPngBuffer)
        .flatten({ background: { r: 255, g: 255, b: 255 } })
        .png()
        .toBuffer();

      return buildProcessedFile(file, finalBuffer, 'image/png', '_white_bg.png');
    }

    return buildProcessedFile(file, transparentPngBuffer, 'image/png', '_no_bg.png');
  } catch (error) {
    console.error('Error removing background:', error);
    throw new Error('Failed to remove background from the image.');
  }
};

export const backgroundRemovalService = {
  removeBackground,
};
