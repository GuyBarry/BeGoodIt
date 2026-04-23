import axios from 'axios';
import type { Gender } from '../../entities';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/genders`,
});

export const gendersApi = {
  getAll: async (): Promise<Gender[]> => {
    const { data } = await client.get<Gender[]>('/');
    return data;
  },
};
