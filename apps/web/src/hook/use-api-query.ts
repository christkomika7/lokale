import {
  useQuery,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { api, ApiError } from "#/lib/api-client";

interface UseApiQueryOptions<TResponse, TSelected = TResponse> extends Omit<
  UseQueryOptions<TResponse, ApiError, TSelected, QueryKey>,
  "queryKey" | "queryFn"
> {
  params?: Record<string, string | number | boolean | undefined | null>;
}

export function useApiQuery<TResponse, TSelected = TResponse>(
  queryKey: QueryKey,
  path: string,
  options?: UseApiQueryOptions<TResponse, TSelected>,
) {
  const { params, ...rest } = options ?? {};

  return useQuery<TResponse, ApiError, TSelected, QueryKey>({
    queryKey,
    queryFn: () => api.get<TResponse>(path, { params }),
    ...rest,
  });
}
