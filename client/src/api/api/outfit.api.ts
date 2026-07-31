import apiClient from '../client';
import type { Outfit } from '../../entities/outfit';
import type { User } from '../../entities/user';

export const outfitApi = {
  getByUserId: async (userId: User['id']): Promise<Outfit[]> => {
    const { data } = await apiClient.get<Outfit[]>(`/outfits/${userId}`);
    return data;
  },

  save: async (userId: User['id'], imageId: string, clothingItemIds: string[]): Promise<Outfit> => {
    const { data } = await apiClient.post<Outfit>(`/outfits/${userId}`, { imageId, clothingItemIds });
    return data;
  },

  deleteById: async (userId: User['id'], outfitId: Outfit['id']): Promise<void> => {
    await apiClient.delete(`/outfits/${userId}/${outfitId}`);
  },
};
