import { useMutation } from '@tanstack/react-query';
import type { User } from '../../entities/user';
import { fittingRoomApi } from '../api/fittingRoom.api';

interface Payload {
  userId: User['id'];
  file: File;
}

export function useFindMatches() {
  return useMutation<string[], Error, Payload>({
    mutationFn: ({ userId, file }) => fittingRoomApi.findMatches(userId, file),
  });
}
