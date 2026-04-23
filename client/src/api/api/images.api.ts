import axios from 'axios';
import type { UploadResult } from '../../entities';

const client = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/images`,
});

export const imagesApi = {
  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await client.post<UploadResult>('/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
