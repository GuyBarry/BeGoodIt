import { ClothingItemDto, PaginatedClothingItemsDto } from '../dtos';
import { ClothingFilters } from '../repositories';
import { backgroundRemovalService } from './backgroundRemoval.service';
import { imagesService } from './images.service';
import { AddItemInput, clothingItemService } from './clothingItem.service';
import { classifyClothingItem } from '../ai/classifyClothingItem';
import { generateEmbedding } from '../ai/ai.provider';

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

  // Image save and classification run in parallel — both only need the processed file.
  // ONNX Runtime (CLIP) runs in an isolated child process so there is no shared-heap
  // conflict with libvips (sharp) in the main process.
  const [imageDto, classification] = await Promise.all([
    imagesService.saveImage(processedFile),
    classifyClothingItem({ mimeType: processedFile.mimetype, data: processedFile.buffer }).catch(() => null),
  ]);

  // Embed the description so similarity search is fast at query time (no AI call needed)
  const embedding = classification?.description
    ? await generateEmbedding(classification.description).catch(() => null)
    : null;

  return clothingItemService.addItem(userId, imageDto.id, {
    ...tags,
    embedding,
  });
};

const removeFromCloset = async (userId: string, itemId: string): Promise<void> => {
  return clothingItemService.deleteById(itemId, userId);
};

export const closetService = {
  getItemsByUserId,
  addToCloset,
  removeFromCloset,
};

