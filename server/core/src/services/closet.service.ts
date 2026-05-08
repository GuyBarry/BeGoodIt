import { ClothingItemDto, PaginatedClothingItemsDto } from '../dtos';
import { ClothingFilters } from '../repositories';
import { backgroundRemovalService } from './backgroundRemoval.service';
import { imagesService } from './images.service';
import { AddItemInput, clothingItemService } from './clothingItem.service';

const getItemsByUserId = async (
  userId: string,
  filters: ClothingFilters,
  page: number,
  limit: number,
): Promise<PaginatedClothingItemsDto> => {
  return clothingItemService.getFilteredByUserId(userId, filters, page, limit);
};

const addToCloset = async (
  userId: string,
  file: Express.Multer.File,
  tags: AddItemInput = {},
): Promise<ClothingItemDto> => {
  const processedFile = await backgroundRemovalService.removeBackground(file);
  const imageDto = await imagesService.saveImage(processedFile);
  return clothingItemService.addItem(userId, imageDto.id, tags);
};

const removeFromCloset = async (userId: string, itemId: string): Promise<void> => {
  return clothingItemService.deleteById(itemId, userId);
};

export const closetService = {
  getItemsByUserId,
  addToCloset,
  removeFromCloset,
};

