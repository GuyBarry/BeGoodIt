import type { ClothingItem } from '../../../entities/clothingItem';

export interface MatchedItem {
  item: ClothingItem;
  matchPct: number;
}

export interface AnalysisResult {
  compatibilityPct: number;
  matchedItems: MatchedItem[];
  outfitCount: number;
}

export interface ItemClassification {
  category: string;
  colorGroup: string;
  season: string;
  style: string;
}

export interface RecentTest {
  id: string;
  imageUrl: string;
  name: string;
  testedAt: Date;
  compatibilityPct: number;
  matchCount: number;
  outfitCount: number;
  matchedItems: MatchedItem[];
  classification?: ItemClassification;
}
