import { ClothingItem } from "../db/entities/ClothingItem.entity";
import {
  AIImageInput,
  AIModel,
  generateAIImage,
} from "./ai.provider";

const VIRTUAL_TRY_ON_SYSTEM_INSTRUCTION = `
      ABSOLUTE RULE: Every response must be a single image containing exactly one person. Never generate two people, a split image, a before/after layout, or a side-by-side comparison under any circumstances.

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

      6. Output Format: The output must be a single, photorealistic image in PNG format showing only the person wearing the garment. Never produce a side-by-side comparison, before/after layout, or multiple people in the same image.

      7. Centering: The person must be centered both horizontally and vertically in the output image, with equal whitespace on all sides.
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
      if (item.styles?.length) parts.push(`Style: ${item.styles.map(s => s.name).join(', ')}`);
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
  itemDescription?: string,
): Promise<Buffer> => {
  const itemClause = itemDescription
    ? `The specific item to apply is: ${itemDescription}. If the product image shows a full outfit or multiple items, apply ONLY this specific item.`
    : 'Apply the clothing item shown in the product image.';

  const prompt = `
        CRITICAL: The output must contain exactly ONE person. Do not show two people. Do not create a before/after or side-by-side layout.

        Image 1: the person to dress. Image 2: garment reference only — ignore any person in it.
        ${itemClause}
        Composite the garment from Image 2 onto the person from Image 1 so it fits naturally.
        Center the person in the output with equal whitespace on all sides.

        CRITICAL: Output a single portrait of ONE person wearing the garment. One person. No comparisons. No second figure.
    `;

  const images: AIImageInput[] = [
    { mimeType: bodyImage.mimetype, data: bodyImage.buffer },
    { mimeType: productImage.mimetype, data: productImage.buffer },
  ];

  return generateAIImage(AIModel.GEMINI_2_5_FLASH_IMAGE, prompt, { responseModalities: ['IMAGE'], systemInstruction: VIRTUAL_TRY_ON_SYSTEM_INSTRUCTION }, images);
};
