import { useInfiniteQuery } from "@tanstack/react-query";
import { api, ApiError } from "#/lib/api-client";

interface CursorResponse<TItem> {
  items: TItem[];
  nextCursor: string | number | null;
}

interface UseLoadMoreQueryOptions {
  params?: Record<string, string | number | boolean | undefined | null>;
  enabled?: boolean;
}

// const { items, loadMore, hasMore, isLoadingMore } = useLoadMoreQuery<Track>(["tracks"], "/api/tracks");

// {items.map((track) => <TrackRow key={track.id} track={track} />)}
// {hasMore && (
//   <Button onClick={loadMore} disabled={isLoadingMore}>
//     {isLoadingMore ? "Chargement..." : "Voir plus"}
//   </Button>
// )}

export function useLoadMoreQuery<TItem>(
  queryKey: unknown[],
  path: string,
  options?: UseLoadMoreQueryOptions,
) {
  const { params, enabled } = options ?? {};

  const query = useInfiniteQuery<CursorResponse<TItem>, ApiError>({
    queryKey: [...queryKey, params],
    queryFn: ({ pageParam }) =>
      api.get<CursorResponse<TItem>>(path, {
        params: { ...params, cursor: pageParam as string | number | undefined },
      }),
    initialPageParam: undefined as string | number | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled,
  });

  return {
    ...query,
    items: query.data?.pages.flatMap((p) => p.items) ?? [],
    loadMore: () => query.fetchNextPage(),
    hasMore: !!query.hasNextPage,
    isLoadingMore: query.isFetchingNextPage,
  };
}
