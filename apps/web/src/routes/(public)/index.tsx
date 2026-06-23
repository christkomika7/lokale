import { authClient } from "#/lib/auth-client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)/")({
  component: RouteComponent,
});

function RouteComponent() {
  const session = authClient.useSession();
  return (
    <div>
      Hello "/(public)/home/"!
      <div>{JSON.stringify(session, null, 2)}</div>
    </div>
  );
}
