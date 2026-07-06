import { In } from 'typeorm';
import { AppDataSource } from '../db/datasource';
import { ClothingItem } from '../db/entities';

export interface ClothingFilters {
  search?: string;
  category?: string;
  color?: string;
  season?: string;
  style?: string;
}

export const clothingItemRepository = AppDataSource.getRepository(ClothingItem).extend({
  async getFilteredByUserId(
    userId: string,
    filters: ClothingFilters,
    page: number,
    limit: number,
  ): Promise<{ items: ClothingItem[]; total: number }> {
    // First pass: get ordered+paginated IDs only (avoids pagination issues with ManyToMany joins)
    const idQb = this.createQueryBuilder('ci')
      .select(['ci.id', 'ci.createdAt'])
      .where('ci.userId = :userId', { userId })
      .orderBy('ci.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.search) {
      idQb
        .leftJoin('ci.category', 'searchCat')
        .leftJoin('ci.styles', 'searchStyle')
        .leftJoin('clothing_item_color_groups', 'search_ci_cg', 'search_ci_cg.clothing_item_id = ci.id')
        .leftJoin('color_group', 'searchColor', 'searchColor.id = search_ci_cg.color_group_id')
        .leftJoin('clothing_item_seasons', 'search_ci_s', 'search_ci_s.clothing_item_id = ci.id')
        .leftJoin('season', 'searchSeason', 'searchSeason.id = search_ci_s.season_id')
        .andWhere(
          '(searchStyle.name LIKE :search OR searchCat.name LIKE :search OR searchColor.name LIKE :search OR searchSeason.name LIKE :search)',
          { search: `%${filters.search}%` },
        );
    }
    if (filters.category) {
      idQb
        .leftJoin('ci.category', 'filterCat')
        .andWhere('filterCat.name = :category', { category: filters.category });
    }
    if (filters.color) {
      idQb
        .innerJoin('clothing_item_color_groups', 'ci_cg', 'ci_cg.clothing_item_id = ci.id')
        .innerJoin('color_group', 'filterColor', 'filterColor.id = ci_cg.color_group_id AND filterColor.name = :color', { color: filters.color });
    }
    if (filters.season) {
      idQb
        .innerJoin('clothing_item_seasons', 'ci_s', 'ci_s.clothing_item_id = ci.id')
        .innerJoin('season', 'filterSeason', 'filterSeason.id = ci_s.season_id AND filterSeason.name = :season', { season: filters.season });
    }
    if (filters.style) {
      idQb
        .innerJoin('ci.styles', 'filterStyle')
        .andWhere('filterStyle.name = :style', { style: filters.style });
    }

    const [idRows, total] = await idQb.getManyAndCount();
    if (idRows.length === 0) return { items: [], total };

    // Second pass: load full entities with relations, preserving order
    const ids = idRows.map(r => r.id);
    const items = await this.find({
      where: { id: In(ids) },
      relations: ['colorGroups', 'category', 'seasons', 'styles'],
    });
    const order = new Map(ids.map((id, i) => [id, i]));
    items.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return { items, total };
  },

  getMultipleByIds(ids: string[]): Promise<ClothingItem[]> {
    return this.find({
      where: { id: In(ids) },
      relations: ['colorGroups', 'category', 'seasons', 'styles'],
    });
  },

  deleteByIdAndUserId(id: string, userId: string): Promise<boolean> {
    return this.delete({ id, userId }).then((result) => (result.affected ?? 0) > 0);
  },

  async findMatchingForItem(
    userId: string,
    category: string,
    colorGroup: string,
    season: string,
    style: string,
    limit = 10,
  ): Promise<ClothingItem[]> {
    // Base builder — uses idx_clothing_item_user_category (user_id, category_id)
    const base = () =>
      this.createQueryBuilder('ci')
        .select(['ci.id', 'ci.imageEmbedding'])
        .innerJoin('ci.category', 'cat')
        .innerJoin('ci.colorGroups', 'cg')
        .leftJoin('ci.seasons', 'season')
        .where('ci.userId = :userId', { userId })
        .andWhere('cat.name = :category', { category })
        .andWhere('cg.name = :colorGroup', { colorGroup })
        .limit(limit);

    // Perfect match: category + color + season + style
    // All-Season items always count as a season match
    const perfect = await base()
      .andWhere('(season.name = :season OR season.name = :allSeason)', { season, allSeason: 'All-Season' })
      .innerJoin('ci.styles', 'styleMatch')
      .andWhere('styleMatch.name = :style', { style })
      .getMany();

    if (perfect.length > 0) return perfect;

    // Fallback: category + color only
    return base().getMany();
  },
});
