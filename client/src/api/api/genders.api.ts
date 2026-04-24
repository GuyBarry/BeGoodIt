import apiClient from '../client';
import type { Gender } from '../../entities';

export const gendersApi = {
  getAll: async (): Promise<Gender[]> => {
    const { data } = await apiClient.get<Gender[]>('/genders');
    return data;
  },
};
