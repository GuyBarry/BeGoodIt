import apiClient from '../client';
import type { User } from '../../entities/user';

export type GenerateLookResult = {
  url: string;
  imageId: string;
};

export const fittingRoomApi = {
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
};
