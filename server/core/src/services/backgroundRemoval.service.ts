import { removeBackground as rembg } from "@imgly/background-removal-node";
import sharp from "sharp";

const removeBackground = async (
  file: Express.Multer.File,
): Promise<Express.Multer.File> => {
  try {

    const normalizedBuffer = await sharp(file.buffer)
        .png() 
        .toBuffer();

        const inputBlob = new Blob([normalizedBuffer], { type: 'image/png' });

    const outputImage = await rembg(inputBlob);

    // 3. Convert the result back to a Buffer as a PNG
    const arrayBuffer = await outputImage.arrayBuffer();
    const newBuffer = Buffer.from(arrayBuffer);
    // 4. Send the new image directly back to the client!
    return {
      ...file,
      buffer: newBuffer,
      mimetype: "image/png",
      originalname: file.originalname.replace(/\.[^/.]+$/, "_no_bg.png"),
      size: newBuffer.length,
    };
  } catch (error) {
    console.error("Error removing background:", error);
    throw new Error("Failed to remove background from the image.");
  }
};

export const backgroundRemovalService = {
  removeBackground,
};
