import sharp from 'sharp';
import { Image } from '../db/entities';
import { bodyMappingRepository } from '../repositories';
import { NotFoundException } from '../exceptions/httpExceptions';
import { generateOutfit, generateProductTryOn, GenerateOutfitInput } from '../ai/prompt.manager';
import { imagesService } from './images.service';
import { clothingItemService } from './clothingItem.service';
import { outfitService } from './outfit.service';

const toMulterFile = (image: Image): Express.Multer.File => ({
  fieldname: 'file',
  originalname: image.originalName,
  encoding: '7bit',
  mimetype: image.mimeType,
  size: image.size,
  buffer: image.data,
  stream: null as any,
  destination: '',
  filename: '',
  path: '',
});

export type FitResult = {
  imageBuffer: Buffer;
  imageId: string;
};

const createFit = async (userId: string, clothingItemIds: string[]): Promise<FitResult> => {
  // Cache hit: an outfit with exactly these items was already saved by the user before
  const cached = await outfitService.findCachedOutfit(userId, clothingItemIds);
  if (cached?.imageId) {
    const imageEntity = await imagesService.getImageById(cached.imageId);
    return { imageBuffer: imageEntity.data, imageId: cached.imageId };
  }

  const bodyMapping = await bodyMappingRepository.findOne({ where: { userId } });
  if (!bodyMapping) {
    throw new NotFoundException("Please upload a body photo before generating a look.");
  }

  const bodyImageEntity = await imagesService.getImageById(bodyMapping.imageId);
  const bodyImage = toMulterFile(bodyImageEntity);

  const clothingItems = await clothingItemService.getMultipleByIds(clothingItemIds);
  if (clothingItems.length === 0) {
    throw new NotFoundException('No clothing items found for the provided IDs');
  }

  const itemsWithImages = clothingItems.filter((item) => item.imageId != null);
  if (itemsWithImages.length === 0) {
    throw new NotFoundException('None of the selected clothing items have an uploaded image');
  }

  const clothingItemsImages = await Promise.all(
    itemsWithImages.map((item) => imagesService.getImageById(item.imageId!).then(toMulterFile)),
  );

  const input: GenerateOutfitInput = { bodyImage, clothingItemsImages, clothingItems };
  const imageBuffer = await generateOutfit(input);

  // Store the generated image so the client can reference it when saving the outfit
  const imageDto = await imagesService.saveImage({
    fieldname: 'file',
    originalname: 'outfit.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: imageBuffer.length,
    buffer: imageBuffer,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  });

  return { imageBuffer, imageId: imageDto.id };
};

const centerSubject = async (imageBuffer: Buffer): Promise<Buffer> => {
  const { width: origW = 1024, height: origH = 1024 } = await sharp(imageBuffer).metadata();

  // Get raw RGBA pixels to find the exact content bounding box
  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  let minX = width, maxX = 0, minY = height, maxY = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
      // Non-transparent and clearly non-white pixel = content (ignores faint ghost artifacts)
      if (a > 20 && (r < 180 || g < 180 || b < 180)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (minX >= maxX || minY >= maxY) return imageBuffer;

  const contentW = maxX - minX + 1;
  const contentH = maxY - minY + 1;

  const cropped = await sharp(imageBuffer)
    .extract({ left: minX, top: minY, width: contentW, height: contentH })
    .toBuffer();

  const padH = Math.max(0, origW - contentW);
  const padV = Math.max(0, origH - contentH);

  return sharp(cropped)
    .extend({
      left: Math.floor(padH / 2),
      right: Math.ceil(padH / 2),
      top: Math.floor(padV / 2),
      bottom: Math.ceil(padV / 2),
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();
};

const createProductTryOn = async (userId: string, productImage: Express.Multer.File, itemDescription?: string): Promise<FitResult> => {
  const bodyMapping = await bodyMappingRepository.findOne({ where: { userId } });
  if (!bodyMapping) throw new NotFoundException("Please upload a body photo before trying on this product.");

  const bodyImageEntity = await imagesService.getImageById(bodyMapping.imageId);
  const bodyImage = toMulterFile(bodyImageEntity);

  const rawBuffer = await generateProductTryOn(bodyImage, productImage, itemDescription);
  const imageBuffer = await centerSubject(rawBuffer);

  const imageDto = await imagesService.saveImage({
    fieldname: 'file',
    originalname: 'tryon.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: imageBuffer.length,
    buffer: imageBuffer,
    stream: null as any,
    destination: '',
    filename: '',
    path: '',
  });

  return { imageBuffer, imageId: imageDto.id };
};

export const fittingRoomService = {
  createFit,
  createProductTryOn,
};
