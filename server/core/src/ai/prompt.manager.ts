import { ClothingItem } from "../db/entities/ClothingItem.entity";
import {
  AIImageInput,
  AIModel,
  generateAIImage,
} from "./ai.provider";

const VIRTUAL_TRY_ON_SYSTEM_INSTRUCTION = `
      You are an advanced, photorealistic virtual try-on assistant designed for a digital wardrobe application.
      Your objective is to take an image of a user's avatar or person and seamlessly composite a provided
      garment onto them.

      When generating the final image, you must strictly adhere to the following
      constraints:

      1. Preserve Identity: The person's face, skin tone, hair, and body proportions must
      remain exactly as they appear in the source image.

      2. Garment Fidelity: Maintain the exact texture, color, pattern, and style of the
      provided clothing item. Do not hallucinate new logos, text, or structural
      changes to the garment.

      3. Realistic Physics and Drape: The clothing must fit naturally on the person's
      specific body shape. Simulate realistic fabric draping, folds, and stretching
      based on the pose.

      4. Lighting and Shadows: Match the lighting, shadows, and environment of the
      original person/avatar image so the clothing looks like it naturally belongs in
      the scene, not pasted on.

      5. No Artifacts: The final image must be free of visual artifacts, distortions.

      6. Output Format: The output must be a single, photorealistic image in PNG format.
    `;

export interface GenerateOutfitInput {
  bodyImage: Express.Multer.File;
  clothingItemsImages: Express.Multer.File[];
  clothingItems: ClothingItem[];
}

export const generateOutfit = async (
  input: GenerateOutfitInput,
): Promise<Buffer> => {
  const { bodyImage, clothingItemsImages, clothingItems } = input;

  const clothingDescriptions = clothingItems
    .map((item, index) => {
      const parts: string[] = [`Item ${index + 1}:`];
      if (item.style) parts.push(`Style: ${item.style}`);
      return parts.join(", ");
    })
    .join("\n        ");

  const prompt = `
        Task: Please fit the provided clothing item onto the provided person based on
        the description below. Ensure a highly realistic, artifact-free output.

        Clothing items descriptions:
        ${clothingDescriptions}
    `;

  const config = {
    responseModalities: ["IMAGE"],
    systemInstruction: VIRTUAL_TRY_ON_SYSTEM_INSTRUCTION,
  };

  const images: AIImageInput[] = [
    { mimeType: bodyImage.mimetype, data: bodyImage.buffer },
    ...clothingItemsImages.map((file) => ({
      mimeType: file.mimetype,
      data: file.buffer,
    })),
  ];

  return generateAIImage(AIModel.GEMINI_2_5_FLASH_IMAGE, prompt, config, images);
};

export const generateProductTryOn = async (
  bodyImage: Express.Multer.File,
  productImage: Express.Multer.File,
): Promise<Buffer> => {
  const prompt = `
        Task: The first image is a person. The second image is a product clothing item.
        Place the clothing item onto the person so it fits naturally and realistically.
        Ensure a highly realistic, artifact-free output in PNG format.
    `;

  const images: AIImageInput[] = [
    { mimeType: bodyImage.mimetype, data: bodyImage.buffer },
    { mimeType: productImage.mimetype, data: productImage.buffer },
  ];

  return generateAIImage(AIModel.GEMINI_2_5_FLASH_IMAGE, prompt, { responseModalities: ['IMAGE'], systemInstruction: VIRTUAL_TRY_ON_SYSTEM_INSTRUCTION }, images);
};
