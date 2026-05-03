import { ClothingItemDto } from '../dtos';
import { backgroundRemovalService } from './backgroundRemoval.service';
import { imagesService } from './images.service';
import { clothingItemService } from './clothingItem.service';

const getItemsByUserId = async (userId: string): Promise<ClothingItemDto[]> => {
  return clothingItemService.getAllByUserId(userId);
};

const addToCloset = async (userId: string, file: Express.Multer.File): Promise<ClothingItemDto> => {
  const processedFile = await backgroundRemovalService.removeBackground(file);
  const imageDto = await imagesService.saveImage(processedFile);
  return clothingItemService.addItem(userId, `/images/${imageDto.id}`);
};

export const closetService = {
  getItemsByUserId,
  addToCloset,
};

