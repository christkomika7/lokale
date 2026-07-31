import {
  useQuery,
  keepPreviousData,
  type UseQueryOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { api, ApiError } from "#/lib/api-client";

type ApiParams = Record<string, string | number | boolean | undefined | null>;

interface UseApiQueryOptions<
  TResponse,
  TSelected = TResponse,
  TParams extends ApiParams = ApiParams,
> extends Omit<
  UseQueryOptions<TResponse, ApiError, TSelected, QueryKey>,
  "queryKey" | "queryFn"
> {
  params?: TParams;
}

export function useApiQuery<
  TResponse,
  TSelected = TResponse,
  TParams extends ApiParams = ApiParams,
>(
  queryKey: QueryKey,
  path: string,
  options?: UseApiQueryOptions<TResponse, TSelected, TParams>,
) {
  const { params, ...rest } = options ?? {};

  return useQuery<TResponse, ApiError, TSelected, QueryKey>({
    queryKey,
    queryFn: () => api.get<TResponse>(path, { params }),
    placeholderData: keepPreviousData,
    ...rest,
  });
}
