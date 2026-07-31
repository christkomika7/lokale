import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { businessApi } from "#/components/dashboard/business/lib/api";
import { Loader2 } from "lucide-react";
import BusinessManager from "#/components/dashboard/business/business-manager";

export const Route = createFileRoute(
  "/(private)/workspace/business/$id/manage",
)({
  component: ManageBusinessPage,
});

function ManageBusinessPage() {
  const { id } = Route.useParams();
  const { data: business, isLoading } = businessApi.getBusiness(id);

  if (isLoading || !business) {
    return (
      <div className="flex items-center justify-center py-20 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{business.name}</h1>

      <Tabs defaultValue="actions" className="space-y-3">
        <TabsList>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
          <TabsTrigger value="catalog">Catalogue</TabsTrigger>
          <TabsTrigger value="formations">Formations</TabsTrigger>
        </TabsList>

        <TabsContent value="actions">
          <BusinessManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
