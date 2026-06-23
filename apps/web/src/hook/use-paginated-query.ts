import { useState } from "react";
import { keepPreviousData } from "@tanstack/react-query";
import { useApiQuery } from "#/hook/use-api-query";

interface PaginatedResponse<TItem> {
  items: TItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface UsePaginatedQueryOptions {
  initialPage?: number;
  pageSize?: number;
  params?: Record<string, string | number | boolean | undefined | null>;
  enabled?: boolean;
}

// const { items, hasNextPage, hasPreviousPage, nextPage, previousPage } =
//   usePaginatedQuery<Venue>(["venues"], "/api/venues");

export function usePaginatedQuery<TItem>(
  queryKey: unknown[],
  path: string,
  options?: UsePaginatedQueryOptions,
) {
  const { initialPage = 1, pageSize = 20, params, enabled } = options ?? {};
  const [page, setPage] = useState(initialPage);

  const query = useApiQuery<PaginatedResponse<TItem>>(
    [...queryKey, page, pageSize, params],
    path,
    {
      params: { ...params, page, pageSize },
      placeholderData: keepPreviousData,
      enabled,
    },
  );

  const totalPages = query.data?.totalPages ?? 1;

  return {
    ...query,
    items: query.data?.items ?? [],
    page,
    pageSize,
    totalItems: query.data?.totalItems ?? 0,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
    previousPage: () => setPage((p) => Math.max(p - 1, 1)),
    goToPage: (target: number) =>
      setPage(Math.min(Math.max(target, 1), totalPages)),
  };
}
