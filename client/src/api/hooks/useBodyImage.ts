import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BodyMapping } from '../../entities/bodyMapping';
import type { User } from '../../entities/user';
import { bodyApi } from '../api/body.api';
import { queryKeys } from '../queryKeys';

export function useBodyImage(userId: User['id']) {
  return useQuery<BodyMapping | null>({
    queryKey: queryKeys.bodyMapping.getByUserId(userId),
    queryFn: () => bodyApi.getByUserId(userId),
    enabled: !!userId,
  });
}

export function useInvalidateBodyImage() {
  const queryClient = useQueryClient();
  return (userId: User['id']) =>
    queryClient.invalidateQueries({ queryKey: queryKeys.bodyMapping.getByUserId(userId) });
}
