import type { ClothingItemDto } from '../../dtos/clothingItem.dto';

export type OutfitDto = {
  id: string;
  userId: string;
  name: string | null;
  isFavorite: boolean;
  imageId: string | null;
  createdAt: Date;
  items: ClothingItemDto[];
};
