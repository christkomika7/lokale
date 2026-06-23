import { QueryCache, MutationCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "#/lib/api-client";
import { useBanStore } from "#/store/ban.store";

interface ApiErrorDetails {
  reason?: string;
  banExpires?: string;
}

function handleApiError(error: unknown, meta?: Record<string, unknown>) {
  if (!(error instanceof ApiError)) return;

  if (error.status === 403 || error.status === 429) {
    const details = error.details as ApiErrorDetails | null;
    useBanStore.getState().setBan({
      permanent: !details?.banExpires,
      reason: details?.reason ?? error.message,
      banExpires: details?.banExpires ?? null,
    });
    return;
  }

  const customMessage = meta?.errorMessage as string | undefined;
  toast.error(customMessage ?? error.message);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        error instanceof ApiError && error.status >= 500 && count < 2,
      staleTime: 30_000,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.silent) return;
      handleApiError(error, query.meta);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if (mutation.meta?.silent) return;
      handleApiError(error, mutation.meta);
    },
  }),
});
