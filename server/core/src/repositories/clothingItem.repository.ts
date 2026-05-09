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
});
