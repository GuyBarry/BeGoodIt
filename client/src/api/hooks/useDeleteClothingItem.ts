import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';
import { clothingItemsApi } from '../api/clothingItems.api';
import { queryKeys } from '../queryKeys';

export function useDeleteClothingItem(userId: User['id']) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ClothingItem['id']>({
    mutationFn: (id) => clothingItemsApi.deleteById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clothingItems.getByUserId(userId) });
    },
  });
}
