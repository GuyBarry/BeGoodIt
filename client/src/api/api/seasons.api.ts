import apiClient from '../client';
import type { Season } from '../../entities';

export const seasonsApi = {
  getAll: async (): Promise<Season[]> => {
    const { data } = await apiClient.get<Season[]>('/seasons');
    return data;
  },
};
