import type { ClothingItem } from './clothingItem';
import type { OutfitFolder } from './outfitFolder';

export interface Outfit {
  id: string;
  userId: string;
  folderId: string | null;
  name: string | null;
  isFavorite: boolean;
  imageId: string | null;
  createdAt: string;
  folder?: OutfitFolder;
  items?: ClothingItem[];
}
