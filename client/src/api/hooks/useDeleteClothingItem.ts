import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';
import { clothingItemsApi } from '../api/closet.api';

export interface DeleteClothingItemInput {
  id: ClothingItem['id'];
  removeOutfits?: boolean;
}

export function useDeleteClothingItem(userId: User['id']) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteClothingItemInput>({
    mutationFn: ({ id, removeOutfits }) => clothingItemsApi.deleteById(userId, id, { removeOutfits }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clothingItems', userId] });
      queryClient.invalidateQueries({ queryKey: ['outfits', userId] });
    },
  });
}
