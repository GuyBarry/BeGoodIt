import apiClient from '../client';
import type { User } from '../../entities';

export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  identifier: string;
  password: string;
};

export const authApi = {
  loginWithGoogle: async (credential: string): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/google', { credential });
    return data;
  },

  register: async (payload: RegisterPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/register', payload);
    return data;
  },

  login: async (payload: LoginPayload): Promise<User> => {
    const { data } = await apiClient.post<User>('/auth/login', payload);
    return data;
  },
};
