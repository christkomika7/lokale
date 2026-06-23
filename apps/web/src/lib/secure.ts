import type { Session } from "#/types/context";
import { redirect } from "@tanstack/react-router";

export function secureAuth(session: Session | null) {
  if (session) {
    throw redirect({ to: "/" });
  }
}
