import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Outfit } from '../../entities/outfit';
import type { User } from '../../entities/user';
import { outfitApi } from '../api/outfit.api';

export function useDeleteOutfit(userId: User['id']) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, Outfit['id']>({
    mutationFn: (outfitId) => outfitApi.deleteById(userId, outfitId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outfits', userId] });
    },
  });
}
