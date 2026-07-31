import { useMutation } from '@tanstack/react-query';
import type { User } from '../../entities/user';
import { fittingRoomApi, type GenerateLookResult } from '../api/fittingRoom.api';

interface Payload {
  userId: User['id'];
  clothingItemIds: string[];
  recreate?: boolean;
}

export function useGenerateLook() {
  return useMutation<GenerateLookResult, Error, Payload>({
    mutationFn: ({ userId, clothingItemIds, recreate }) =>
      fittingRoomApi.generateLook(userId, clothingItemIds, recreate),
  });
}
