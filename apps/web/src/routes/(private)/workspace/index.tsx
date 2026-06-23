import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/workspace/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/(private)/workspace/"!</div>;
}
