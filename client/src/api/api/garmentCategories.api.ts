import apiClient from '../client';
import type { GarmentCategory } from '../../entities';

export const garmentCategoriesApi = {
  getAll: async (): Promise<GarmentCategory[]> => {
    const { data } = await apiClient.get<GarmentCategory[]>('/garment-categories');
    return data;
  },
};
