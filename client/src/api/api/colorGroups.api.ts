import apiClient from '../client';
import type { ColorGroup } from '../../entities';

export const colorGroupsApi = {
  getAll: async (): Promise<ColorGroup[]> => {
    const { data } = await apiClient.get<ColorGroup[]>('/color-groups');
    return data;
  },
};
