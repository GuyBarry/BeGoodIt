import type { ColorGroup, GarmentCategory, Season } from '../../../entities';

export interface SelectedTags {
  category: GarmentCategory | null;
  colors: ColorGroup[];
  seasons: Season[];
  styles: string[];
}

export const EMPTY_TAGS: SelectedTags = { category: null, colors: [], seasons: [], styles: [] };

export const STYLE_OPTIONS = ['Casual', 'Formal', 'Smart Casual', 'Sporty', 'Bohemian'] as const;
