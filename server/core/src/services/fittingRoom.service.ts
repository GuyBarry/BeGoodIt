import { Image } from '../db/entities';
import { bodyMappingRepository } from '../repositories';
import { NotFoundException } from '../exceptions/httpExceptions';
import { generateOutfit, GenerateOutfitInput } from '../ai/prompt.manager';
import { imagesService } from './images.service';
import { clothingItemService } from './clothingItem.service';

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

const createFit = async (userId: string, clothingItemIds: string[]): Promise<Buffer> => {
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

  const clothingItemsImages = await Promise.all(
    clothingItems.map((item) => imagesService.getImageById(item.imageId).then(toMulterFile)),
  );

  const input: GenerateOutfitInput = {
    bodyImage,
    clothingItemsImages,
    clothingItems,
  };

  return generateOutfit(input);
};

export const fittingRoomService = {
  createFit,
};
