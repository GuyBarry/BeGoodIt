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
    getById: (id: string) => ['user', id] as const,
  },
} as const;
