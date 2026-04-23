import { useQuery } from '@tanstack/react-query';
import type { Season } from '../../entities';
import { seasonsApi } from '../api/seasons.api';
import { queryKeys } from '../queryKeys';

export function useSeasons() {
  return useQuery<Season[]>({
    queryKey: queryKeys.seasons.getAll,
    queryFn: seasonsApi.getAll,
  });
}
