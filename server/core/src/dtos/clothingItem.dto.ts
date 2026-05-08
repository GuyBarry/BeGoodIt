import { ColorGroupDto } from './colorGroup.dto';
import { GarmentCategoryDto } from './garmentCategory.dto';
import { SeasonDto } from './season.dto';

export type ClothingItemDto = {
  id: string;
  userId: string;
  imageId: string | null;
  style: string | null;
  colorGroup: ColorGroupDto | null;
  category: GarmentCategoryDto | null;
  season: SeasonDto | null;
  createdAt: Date;
};
