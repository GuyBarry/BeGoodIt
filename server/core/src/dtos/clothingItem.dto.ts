import { ColorGroupDto } from './colorGroup.dto';
import { GarmentCategoryDto } from './garmentCategory.dto';
import { SeasonDto } from './season.dto';

export type ClothingItemDto = {
  id: string;
  userId: string;
  imageId: string | null;
  styles: string[];
  colorGroups: ColorGroupDto[];
  category: GarmentCategoryDto | null;
  seasons: SeasonDto[];
  createdAt: Date;
};

export type PaginatedClothingItemsDto = {
  items: ClothingItemDto[];
  total: number;
};
