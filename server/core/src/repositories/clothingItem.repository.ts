import { AppDataSource } from '../db/datasource';
import { ClothingItem } from '../db/entities';

export const clothingItemRepository = AppDataSource.getRepository(ClothingItem).extend({
  getAllByUserId(userId: string): Promise<ClothingItem[]> {
    return this.find({
      where: { userId },
      relations: ['colorGroup', 'category', 'season'],
    });
  },
});
