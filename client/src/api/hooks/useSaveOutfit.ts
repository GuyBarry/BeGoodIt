import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../entities/user';
import { outfitApi } from '../api/outfit.api';

interface Payload {
  userId: User['id'];
  imageId: string;
  clothingItemIds: string[];
}

export function useSaveOutfit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, imageId, clothingItemIds }: Payload) =>
      outfitApi.save(userId, imageId, clothingItemIds),
    onSuccess: (_data, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['outfits', userId] });
    },
  });
}
