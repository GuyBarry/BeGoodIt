import apiClient from '../client';
import type { User } from '../../entities';

export type UpdateUserPayload = Partial<
  Pick<User, 'username' | 'profilePictureUrl' | 'birthdate' | 'heightCm' | 'bodyType'> & {
    genderId: number;
  }
>;

export const userApi = {
  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get<User>(`/users/${id}`);
    return data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.put<User>(`/users/${id}`, payload);
    return data;
  },
};
