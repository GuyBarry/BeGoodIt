import type { Cloth } from './cloth';
import type { OutfitFolder } from './outfitFolder';

export interface Outfit {
  outfitId: string;
  userId: string;
  folderId: string | null;
  name: string | null;
  isFavorite: boolean;
  createdAt: string;
  folder?: OutfitFolder;
  items?: Cloth[];
}
