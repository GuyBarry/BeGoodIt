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
} as const;
