import NavList from "#/components/navigation/nav-list";
import { adminNavLinks } from "#/config/navigation";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/admin")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="space-y-4">
      <NavList links={adminNavLinks} />
      <Outlet />
    </div>
  );
}
