import BusinessManager from "#/components/dashboard/business/business-manager";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(private)/workspace/business/")({
  component: BusinessesPage,
});

function BusinessesPage() {
  return (
    <div className="p-6">
      <BusinessManager />
    </div>
  );
}
