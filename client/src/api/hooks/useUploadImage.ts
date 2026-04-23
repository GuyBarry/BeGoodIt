import { useMutation } from '@tanstack/react-query';
import type { UploadResult } from '../../entities';
import { imagesApi } from '../api/images.api';

export function useUploadImage() {
  return useMutation<UploadResult, Error, File>({
    mutationFn: imagesApi.upload,
  });
}
