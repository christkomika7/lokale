import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/admin/workspace")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex h-full overflow-hidden">
      Hello "/(private)/admin/workspace"!
    </div>
  );
}
