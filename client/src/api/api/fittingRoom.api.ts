import apiClient from '../client';
import type { User } from '../../entities/user';

export type GenerateLookResult = {
  url: string;
  imageId: string;
};

export const fittingRoomApi = {
  findMatches: async (userId: User['id'], file: File): Promise<string[]> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ matchedItemIds: string[] }>(
      `/fitting-room/${userId}/find-matches`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data.matchedItemIds;
  },

  generateLook: async (userId: User['id'], clothingItemIds: string[]): Promise<GenerateLookResult> => {
    const response = await apiClient.post<Blob>(
      `/fitting-room/${userId}/outfit`,
      { clothingItemIds },
      { responseType: 'blob' },
    );
    return {
      url: URL.createObjectURL(response.data),
      imageId: response.headers['x-image-id'] as string,
    };
  },

  tryOnProduct: async (userId: User['id'], file: File): Promise<GenerateLookResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<Blob>(
      `/fitting-room/${userId}/try-on-product`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' }, responseType: 'blob' },
    );
    return {
      url: URL.createObjectURL(response.data),
      imageId: response.headers['x-image-id'] as string,
    };
  },
};
