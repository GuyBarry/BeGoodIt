import { In } from 'typeorm';
import { AppDataSource } from '../db/datasource';
import { ClothingItem } from '../db/entities';

export const clothingItemRepository = AppDataSource.getRepository(ClothingItem).extend({
  getAllByUserId(userId: string): Promise<ClothingItem[]> {
    return this.find({
      where: { userId },
      relations: ['colorGroup', 'category', 'season'],
    });
  },

  getMultipleByIds(ids: string[]): Promise<ClothingItem[]> {
    return this.find({
      where: { id: In(ids) },
      relations: ['colorGroup', 'category', 'season'],
    });
  },

  deleteById(id: string): Promise<void> {
    return this.delete(id).then(() => undefined);
  },
});
