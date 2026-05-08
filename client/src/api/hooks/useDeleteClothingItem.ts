import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';
import { clothingItemsApi } from '../api/closet.api';
import { queryKeys } from '../queryKeys';

export function useDeleteClothingItem(userId: User['id']) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, ClothingItem['id']>({
    mutationFn: (id) => clothingItemsApi.deleteById(userId, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clothingItems', userId] });
    },
  });
}
