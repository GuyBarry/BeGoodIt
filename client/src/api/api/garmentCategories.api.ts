import axios from 'axios';
import type { GarmentCategory } from '../../entities';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/garment-categories`,
});

export const garmentCategoriesApi = {
  getAll: async (): Promise<GarmentCategory[]> => {
    const { data } = await client.get<GarmentCategory[]>('/');
    return data;
  },
};
