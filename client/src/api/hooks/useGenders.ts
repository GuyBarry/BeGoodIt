import { useQuery } from '@tanstack/react-query';
import type { Gender } from '../../entities';
import { gendersApi } from '../api/genders.api';
import { queryKeys } from '../queryKeys';

export function useGenders() {
  return useQuery<Gender[]>({
    queryKey: queryKeys.genders.getAll,
    queryFn: gendersApi.getAll,
  });
}
