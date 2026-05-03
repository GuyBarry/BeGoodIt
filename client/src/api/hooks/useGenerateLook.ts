import { useMutation } from '@tanstack/react-query';
import type { User } from '../../entities/user';
import { fittingRoomApi } from '../api/fittingRoom.api';

interface Payload {
  userId: User['id'];
  clothingItemIds: string[];
}

export function useGenerateLook() {
  return useMutation<string, Error, Payload>({
    mutationFn: ({ userId, clothingItemIds }) =>
      fittingRoomApi.generateLook(userId, clothingItemIds),
  });
}
