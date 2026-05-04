import apiClient from '../client';
import type { BodyMapping } from '../../entities/bodyMapping';
import type { User } from '../../entities/user';

export const bodyApi = {
  uploadImage: async (file: File, userId: User['id']): Promise<BodyMapping> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    const { data } = await apiClient.post<BodyMapping>('/body/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
