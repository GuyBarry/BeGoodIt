import axios from 'axios';
import type { Season } from '../../entities';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/seasons`,
});

export const seasonsApi = {
  getAll: async (): Promise<Season[]> => {
    const { data } = await client.get<Season[]>('/');
    return data;
  },
};
