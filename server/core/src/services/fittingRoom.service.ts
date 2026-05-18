import { Image } from '../db/entities';
import { bodyMappingRepository } from '../repositories';
import { NotFoundException } from '../exceptions/httpExceptions';
import { generateOutfit, GenerateOutfitInput } from '../ai/prompt.manager';
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
    throw new NotFoundException(`No body image found for user '${userId}'`);
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

export const fittingRoomService = {
  createFit,
};
