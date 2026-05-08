import { useQuery } from '@tanstack/react-query';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';
import { clothingItemsApi } from '../api/closet.api';
import { queryKeys } from '../queryKeys';

export function useClothingItems(userId: User['id']) {
  return useQuery<ClothingItem[]>({
    queryKey: queryKeys.clothingItems.getByUserId(userId),
    queryFn: async () => {
      const result = await clothingItemsApi.getByUserId(userId, { page: 1, limit: 500 });
      return result.items;
    },
    enabled: !!userId,
  });
}
