import { Outfit } from '../db/entities';
import { OutfitDto } from '../db/entities/Outfit.dto';
import { ClothingItemDto } from '../dtos';
import { NotFoundException } from '../exceptions/httpExceptions';
import { outfitRepository } from '../repositories';
import { clothingItemService } from './clothingItem.service';

const toItemDto = (item: Outfit['items'][number]): ClothingItemDto => ({
  id: item.id,
  userId: item.userId,
  imageId: item.imageId,
  styles: (item.styles ?? []).map(s => s.name),
  colorGroups: (item.colorGroups ?? []).map(cg => ({ id: cg.id, name: cg.name })),
  category: item.category ? { id: item.category.id, name: item.category.name } : null,
  seasons: (item.seasons ?? []).map(s => ({ id: s.id, name: s.name })),
  createdAt: item.createdAt,
});

const toDto = (outfit: Outfit): OutfitDto => ({
  id: outfit.id,
  userId: outfit.userId,
  name: outfit.name,
  isFavorite: outfit.isFavorite,
  imageId: outfit.imageId,
  createdAt: outfit.createdAt,
  items: (outfit.items ?? []).map(toItemDto),
});

const saveOutfit = async (
  userId: string,
  imageId: string,
  clothingItemIds: string[],
): Promise<OutfitDto> => {
  const items = await clothingItemService.getMultipleByIds(clothingItemIds);
  const outfit = await outfitRepository.createOutfit(userId, items, imageId);
  return toDto(outfit);
};

const getUserOutfits = async (userId: string): Promise<OutfitDto[]> => {
  const outfits = await outfitRepository.findByUserId(userId);
  return outfits.map(toDto);
};

const findCachedOutfit = (userId: string, clothingItemIds: string[]) =>
  outfitRepository.findExactMatch(userId, clothingItemIds);

const replaceOutfitImage = (outfitId: string, imageId: string): Promise<void> =>
  outfitRepository.replaceImage(outfitId, imageId);

const deleteOutfit = async (userId: string, outfitId: string): Promise<void> => {
  const deleted = await outfitRepository.deleteByIdAndUserId(outfitId, userId);
  if (!deleted) {
    throw new NotFoundException('Outfit not found');
  }
};

export const outfitService = {
  saveOutfit,
  getUserOutfits,
  findCachedOutfit,
  replaceOutfitImage,
  deleteOutfit,
};
