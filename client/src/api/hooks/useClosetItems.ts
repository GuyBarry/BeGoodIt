import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { User } from '../../entities/user';
import { clothingItemsApi, type ClosetFilters, type PaginatedClothingItems } from '../api/closet.api';
import { queryKeys } from '../queryKeys';

export function useClosetItems(userId: User['id'], filters: ClosetFilters = {}) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.clothingItems.closet(userId, filters);
  const limit = filters.limit ?? 20;

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) =>
      clothingItemsApi.getByUserId(userId, { ...filters, page: pageParam, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + (page?.items?.length ?? 0), 0);
      return loaded < lastPage.total ? allPages.length + 1 : undefined;
    },
    enabled: !!userId,
  });

  const resetToFirstPage = () => {
    queryClient.setQueryData(
      queryKey,
      (old: InfiniteData<PaginatedClothingItems> | undefined) => {
        if (!old || old.pages.length <= 1) return old;
        return { pages: [old.pages[0]], pageParams: [old.pageParams[0]] };
      },
    );
  };

  return { ...query, resetToFirstPage };
}
