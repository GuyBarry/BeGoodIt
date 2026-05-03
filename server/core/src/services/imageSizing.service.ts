import sharp from "sharp";

const TARGET_SIZE = 512;

const resizeToSquare = async (buffer: Buffer): Promise<Buffer> => {
  return sharp(buffer)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .toBuffer();
};

export const imageSizingService = {
  resizeToSquare,
};
