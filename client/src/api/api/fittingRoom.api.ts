import apiClient from '../client';
import type { User } from '../../entities/user';

export const fittingRoomApi = {
  generateLook: async (userId: User['id'], clothingItemIds: string[]): Promise<string> => {
    const { data } = await apiClient.post<Blob>(
      `/fitting-room/${userId}/outfit`,
      { clothingItemIds },
      { responseType: 'blob' },
    );
    return URL.createObjectURL(data);
  },
};
