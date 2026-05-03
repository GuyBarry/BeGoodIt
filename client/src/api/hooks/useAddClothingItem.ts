import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ClothingItem } from '../../entities/clothingItem';
import type { User } from '../../entities/user';
import { clothingItemsApi, type UploadClothingItemPayload } from '../api/clothingItems.api';
import { queryKeys } from '../queryKeys';

export function useAddClothingItem(userId: User['id']) {
  const queryClient = useQueryClient();

  return useMutation<ClothingItem, Error, UploadClothingItemPayload>({
    mutationFn: (payload) => clothingItemsApi.upload(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clothingItems.getByUserId(userId) });
    },
  });
}
