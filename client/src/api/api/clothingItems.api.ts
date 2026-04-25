import apiClient from '../client';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';

export const clothingItemsApi = {
  getByUserId: async (userId: User['id']): Promise<ClothingItem[]> => {
    const { data } = await apiClient.get<ClothingItem[]>(`/clothing-items/user/${userId}`);
    return data;
  },

  deleteById: async (id: ClothingItem['id']): Promise<void> => {
    await apiClient.delete(`/clothing-items/${id}`);
  },
};
