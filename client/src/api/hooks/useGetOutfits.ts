import { useQuery } from '@tanstack/react-query';
import type { User } from '../../entities/user';
import { outfitApi } from '../api/outfit.api';

export function useGetOutfits(userId: User['id']) {
  return useQuery({
    queryKey: ['outfits', userId],
    queryFn: () => outfitApi.getByUserId(userId),
  });
}
