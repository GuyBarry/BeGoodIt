import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { BodyMapping } from '../../entities/bodyMapping';
import type { User } from '../../entities/user';
import { bodyApi } from '../api/body.api';
import { queryKeys } from '../queryKeys';

export function useUploadBodyImage() {
  const queryClient = useQueryClient();

  return useMutation<BodyMapping, Error, { file: File; userId: User['id'] }>({
    mutationFn: ({ file, userId }) => bodyApi.uploadImage(file, userId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.bodyMapping.getByUserId(data.userId), data);
    },
  });
}
