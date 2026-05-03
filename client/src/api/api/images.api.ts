import apiClient from '../client';
import type { UploadResult } from '../../entities';

export const imagesApi = {
  upload: async (file: File): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<UploadResult>('/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  getImageUrl: (id: string): string => {
    return `${apiClient.defaults.baseURL}/images/${id}`;
  },
};
