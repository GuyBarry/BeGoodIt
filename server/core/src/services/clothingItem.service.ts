import { ClothingItem } from '../db/entities';
import { ClothingItemDto } from '../dtos';
import { NotFoundException } from '../exceptions/httpExceptions';
import { clothingItemRepository } from '../repositories';

const toDto = (item: ClothingItem): ClothingItemDto => ({
  id: item.id,
  userId: item.userId,
  imageId: item.imageId,
  style: item.style,
  colorGroup: item.colorGroup ? { id: item.colorGroup.id, name: item.colorGroup.name } : null,
  category: item.category ? { id: item.category.id, name: item.category.name } : null,
  season: item.season ? { id: item.season.id, name: item.season.name } : null,
  createdAt: item.createdAt,
});

const getAllByUserId = async (userId: string): Promise<ClothingItemDto[]> => {
  const items = await clothingItemRepository.getAllByUserId(userId);
  return items.map(toDto);
};

const deleteById = async (id: string, userId: string): Promise<void> => {
  const deleted = await clothingItemRepository.deleteByIdAndUserId(id, userId);
  if (!deleted) {
    throw new NotFoundException(`Clothing item not found`);
  }
};

const getMultipleByIds = async (ids: string[]): Promise<ClothingItem[]> => {
  return clothingItemRepository.getMultipleByIds(ids);
};

export interface AddItemInput {
  colorGroupId?: number | null;
  categoryId?: number | null;
  seasonId?: number | null;
  style?: string | null;
}

const addItem = async (userId: string, imageId: string, tags: AddItemInput = {}): Promise<ClothingItemDto> => {
  const item = clothingItemRepository.create({
    userId,
    imageId,
    colorGroupId: tags.colorGroupId ?? null,
    categoryId: tags.categoryId ?? null,
    seasonId: tags.seasonId ?? null,
    style: tags.style ?? null,
    imageEmbedding: null,
  });
  const saved = await clothingItemRepository.save(item);
  return toDto(saved);
};

export const clothingItemService = {
  getAllByUserId,
  getMultipleByIds,
  deleteById,
  addItem,
};
