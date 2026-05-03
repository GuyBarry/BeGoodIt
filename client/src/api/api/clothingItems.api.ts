import apiClient from '../client';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';

export interface UploadClothingItemPayload {
  file: File;
  userId: User['id'];
  colorGroupId?: number | null;
  categoryId?: number | null;
  seasonId?: number | null;
  style?: string | null;
}

export const clothingItemsApi = {
  getByUserId: async (userId: User['id']): Promise<ClothingItem[]> => {
    const { data } = await apiClient.get<ClothingItem[]>(`/clothing-items/user/${userId}`);
    return data;
  },

  upload: async (payload: UploadClothingItemPayload): Promise<ClothingItem> => {
    const formData = new FormData();
    formData.append('file', payload.file);
    formData.append('userId', payload.userId);
    if (payload.colorGroupId != null) formData.append('colorGroupId', String(payload.colorGroupId));
    if (payload.categoryId != null) formData.append('categoryId', String(payload.categoryId));
    if (payload.seasonId != null) formData.append('seasonId', String(payload.seasonId));
    if (payload.style) formData.append('style', payload.style);
    const { data } = await apiClient.post<ClothingItem>('/clothing-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  deleteById: async (id: ClothingItem['id']): Promise<void> => {
    await apiClient.delete(`/clothing-items/${id}`);
  },
};
