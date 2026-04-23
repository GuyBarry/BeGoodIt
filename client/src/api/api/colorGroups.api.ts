import axios from 'axios';
import type { ColorGroup } from '../../entities';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/color-groups`,
});

export const colorGroupsApi = {
  getAll: async (): Promise<ColorGroup[]> => {
    const { data } = await client.get<ColorGroup[]>('/');
    return data;
  },
};
