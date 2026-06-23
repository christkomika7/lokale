import type { authClient } from "#/lib/auth-client";
import type { QueryClient } from "@tanstack/react-query";

export type Session = typeof authClient.$Infer.Session;

export type RouterContext = {
  session: Session | null;
  queryClient: QueryClient | null;
};
