import type { ColorGroup } from './colorGroup';
import type { GarmentCategory } from './garmentCategory';
import type { Season } from './season';

export interface ClothingItem {
  id: string;
  userId: string;
  categoryId: number | null;
  imageId: string;
  styles: string[];
  createdAt: string;
  colorGroups?: ColorGroup[];
  category?: GarmentCategory;
  seasons?: Season[];
}
