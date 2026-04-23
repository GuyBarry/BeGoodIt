import type { ColorGroup } from './colorGroup';
import type { GarmentCategory } from './garmentCategory';
import type { Season } from './season';

export interface Cloth {
  itemId: string;
  userId: string;
  colorGroupId: number | null;
  categoryId: number | null;
  seasonId: number | null;
  imageUrl: string;
  style: string | null;
  createdAt: string;
  colorGroup?: ColorGroup;
  category?: GarmentCategory;
  season?: Season;
}
