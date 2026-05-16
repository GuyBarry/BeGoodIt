import type { User } from '../entities';

export const queryKeys = {
  colorGroups: {
    getAll: ['colorGroups'],
  },
  garmentCategories: {
    getAll: ['garmentCategories'],
  },
  genders: {
    getAll: ['genders'],
  },
  seasons: {
    getAll: ['seasons'],
  },
  user: {
    getById: (id: User['id']) => ['user', id] as const,
  },
  bodyMapping: {
    getByUserId: (userId: User['id']) => ['bodyMapping', userId] as const,
  },
  clothingItems: {
    getByUserId: (userId: User['id']) => ['clothingItems', userId] as const,
    closet: (userId: User['id'], filters: object) => ['clothingItems', userId, 'closet', filters] as const,
  },
} as const;
