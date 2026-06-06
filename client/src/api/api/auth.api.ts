import apiClient from '../client';
import type { User } from '../../entities';

export const authApi = {
  loginWithGoogle: async (credential: string): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/google', { credential });
    return data;
  },
};
