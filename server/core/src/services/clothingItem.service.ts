import { ClothingItem } from '../db/entities';
import { ClothingItemDto } from '../dtos';
import { clothingItemRepository } from '../repositories';

const toDto = (item: ClothingItem): ClothingItemDto => ({
  id: item.id,
  userId: item.userId,
  imageUrl: item.imageUrl,
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

const deleteById = async (id: string): Promise<void> => {
  await clothingItemRepository.deleteById(id);
};

const getMultipleByIds = async (ids: string[]): Promise<ClothingItem[]> => {
  return clothingItemRepository.getMultipleByIds(ids);
};

const addItem = async (userId: string, imageUrl: string): Promise<ClothingItemDto> => {
  const item = clothingItemRepository.create({
    userId,
    imageUrl,
    colorGroupId: null,
    categoryId: null,
    seasonId: null,
    style: null,
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
