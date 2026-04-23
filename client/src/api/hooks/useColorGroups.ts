import { useQuery } from '@tanstack/react-query';
import type { ColorGroup } from '../../entities';
import { colorGroupsApi } from '../api/colorGroups.api';
import { queryKeys } from '../queryKeys';

export function useColorGroups() {
  return useQuery<ColorGroup[]>({
    queryKey: queryKeys.colorGroups.getAll,
    queryFn: colorGroupsApi.getAll,
  });
}
