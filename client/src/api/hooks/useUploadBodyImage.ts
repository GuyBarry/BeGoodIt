import { useMutation } from '@tanstack/react-query';
import type { BodyMapping } from '../../entities/bodyMapping';
import type { User } from '../../entities/user';
import { bodyApi } from '../api/body.api';

export function useUploadBodyImage() {
  return useMutation<BodyMapping, Error, { file: File; userId: User['id'] }>({
    mutationFn: ({ file, userId }) => bodyApi.uploadImage(file, userId),
  });
}
