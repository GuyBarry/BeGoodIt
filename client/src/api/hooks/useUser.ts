import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { User } from '../../entities';
import { userApi, type UpdateUserPayload } from '../api/user.api';
import { queryKeys } from '../queryKeys';

export function useUser(id: string) {
  return useQuery<User>({
    queryKey: queryKeys.user.getById(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation<User, Error, UpdateUserPayload>({
    mutationFn: payload => userApi.update(id, payload),
    onSuccess: updated => {
      queryClient.setQueryData(queryKeys.user.getById(id), updated);
    },
  });
}
