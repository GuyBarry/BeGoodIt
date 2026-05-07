import type { ColorGroup, GarmentCategory, Season } from '../../../entities';

export interface SelectedTags {
  category: GarmentCategory | null;
  color: ColorGroup | null;
  season: Season | null;
  style: string | null;
}

export const EMPTY_TAGS: SelectedTags = { category: null, color: null, season: null, style: null };

export const STYLE_OPTIONS = ['Casual', 'Formal', 'Smart Casual', 'Sporty', 'Bohemian'] as const;
