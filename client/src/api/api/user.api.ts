import apiClient from '../client';
import type { User } from '../../entities';

export type UpdateUserPayload = Partial<
  Pick<User, 'username' | 'profilePictureUrl' | 'birthdate' | 'heightCm' | 'bodyType'> & {
    genderId: number;
  }
>;

// Server returns `gender: { id, name }` — map to flat `genderId` the client uses
const mapUser = (raw: User & { gender?: { id: number; name: string } | null }): User => ({
  ...raw,
  genderId: raw.gender?.id ?? null,
});

export const userApi = {
  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(`/users/${id}`);
    return mapUser(data);
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await apiClient.put(`/users/${id}`, payload);
    return mapUser(data);
  },
};
