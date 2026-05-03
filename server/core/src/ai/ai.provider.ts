import { GoogleGenAI, type Part } from "@google/genai";
import { geminiConfig } from "../config/gemini.config";

export interface AIConfig {
  responseMimeType?: string;
  systemInstruction?: string;
}

export enum AICreativity {
  LOW = 0.3,
  REGULAR = 0.6,
  HIGH = 1,
}

export enum AIModel {
  GEMINI_2_5_FLASH_IMAGE = "gemini-2.5-flash-image",
}

export interface AIImageInput {
  mimeType: string;
  data: Buffer;
}

const ai = new GoogleGenAI({ apiKey: geminiConfig.apiKey });

export async function generateAIContent(
  model: AIModel,
  content: string,
  config: AIConfig,
  images?: AIImageInput[],
): Promise<string> {
  const parts: Part[] = [];

  if (images && images.length > 0) {
    for (const image of images) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data.toString("base64"),
        },
      });
    }
  }

  parts.push({ text: content });

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config,
  });

  return response.text ?? "";
}

export async function generateAIImage(
  model: AIModel,
  content: string,
  config: AIConfig,
  images?: AIImageInput[],
): Promise<Buffer> {
  const parts: Part[] = [];

  if (images && images.length > 0) {
    for (const image of images) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data.toString("base64"),
        },
      });
    }
  }

  parts.push({ text: content });

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts }],
    config,
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.mimeType?.startsWith("image/"),
  );

  if (!imagePart?.inlineData?.data) {
    throw new Error("AI did not return an image in its response.");
  }

  return Buffer.from(imagePart.inlineData.data, "base64");
}
