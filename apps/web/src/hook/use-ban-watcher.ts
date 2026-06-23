import { useEffect } from "react";
import { useApiQuery } from "#/hook/use-api-query";
import { useBanStore } from "#/store/ban.store";
import { ApiError } from "#/lib/api-client";

interface RateLimitStatusResponse {
  banned: false;
}

export function useBanWatcher() {
  const setBan = useBanStore((s) => s.setBan);
  const clearBan = useBanStore((s) => s.clearBan);

  const { isSuccess, error } = useApiQuery<RateLimitStatusResponse>(
    ["rate-limit-status"],
    "/rate-limit/status",
    {
      refetchInterval: 30_000,
      retry: false,
      meta: { silent: true },
    },
  );

  useEffect(() => {
    if (isSuccess) {
      if (useBanStore.getState().banInfo) clearBan();
      return;
    }

    if (
      error instanceof ApiError &&
      (error.status === 403 || error.status === 429)
    ) {
      const details = error.details as {
        reason?: string;
        banExpires?: string;
      } | null;

      setBan({
        permanent: !details?.banExpires,
        reason: details?.reason ?? error.message,
        banExpires: details?.banExpires ?? null,
      });
    }
  }, [isSuccess, error, setBan, clearBan]);
}
