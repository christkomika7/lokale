import Navbar from "#/components/navigation/navbar";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(public)")({
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
