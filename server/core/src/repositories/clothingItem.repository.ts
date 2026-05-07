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

  deleteByIdAndUserId(id: string, userId: string): Promise<boolean> {
    return this.delete({ id, userId }).then((result) => (result.affected ?? 0) > 0);
  },
});
