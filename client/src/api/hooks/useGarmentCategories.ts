import { useQuery } from '@tanstack/react-query';
import type { GarmentCategory } from '../../entities';
import { garmentCategoriesApi } from '../api/garmentCategories.api';
import { queryKeys } from '../queryKeys';

export function useGarmentCategories() {
  return useQuery<GarmentCategory[]>({
    queryKey: queryKeys.garmentCategories.getAll,
    queryFn: garmentCategoriesApi.getAll,
  });
}
