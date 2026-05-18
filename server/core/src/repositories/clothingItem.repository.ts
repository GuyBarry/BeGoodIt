import { In } from 'typeorm';
import { AppDataSource } from '../db/datasource';
import { ClothingItem } from '../db/entities';

export interface ClothingFilters {
  search?: string;
  category?: string;
  color?: string;
  season?: string;
}

export const clothingItemRepository = AppDataSource.getRepository(ClothingItem).extend({
  async getFilteredByUserId(
    userId: string,
    filters: ClothingFilters,
    page: number,
    limit: number,
  ): Promise<{ items: ClothingItem[]; total: number }> {
    const queryBuilder = this.createQueryBuilder('ci')
      .leftJoinAndSelect('ci.colorGroup', 'colorGroup')
      .leftJoinAndSelect('ci.category', 'category')
      .leftJoinAndSelect('ci.season', 'season')
      .where('ci.userId = :userId', { userId })
      .orderBy('ci.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters.search) {
      queryBuilder.andWhere('(ci.style LIKE :search OR category.name LIKE :search)', { search: `%${filters.search}%` });
    }
    if (filters.category) {
      queryBuilder.andWhere('category.name = :category', { category: filters.category });
    }
    if (filters.color) {
      queryBuilder.andWhere('colorGroup.name = :color', { color: filters.color });
    }
    if (filters.season) {
      queryBuilder.andWhere('season.name = :season', { season: filters.season });
    }

    const [items, total] = await queryBuilder.getManyAndCount();
    return { items, total };
  },

  getMultipleByIds(ids: string[]): Promise<ClothingItem[]> {
    return this.find({
      where: { id: In(ids) },
      relations: ['colorGroup', 'category', 'season'],
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
    // Base builder — uses idx_clothing_item_user_lookups (user_id, category_id, color_group_id)
    const base = () =>
      this.createQueryBuilder('ci')
        .select(['ci.id', 'ci.imageEmbedding', 'ci.style'])
        .innerJoin('ci.category', 'cat')
        .innerJoin('ci.colorGroup', 'cg')
        .leftJoin('ci.season', 'season')
        .where('ci.userId = :userId', { userId })
        .andWhere('cat.name = :category', { category })
        .andWhere('cg.name = :colorGroup', { colorGroup })
        .limit(limit);

    // Perfect match: category + color + season + style
    // All-Season items always count as a season match
    const perfect = await base()
      .andWhere('(season.name = :season OR season.name = :allSeason)', { season, allSeason: 'All-Season' })
      .andWhere('ci.style = :style', { style })
      .getMany();

    if (perfect.length > 0) return perfect;

    // Fallback: category + color only
    return base().getMany();
  },
});
