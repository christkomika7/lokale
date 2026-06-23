import Navbar from "#/components/navigation/navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
