import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import Heading from "../typography/heading";
import DetailField from "../ui/detail-field";
import AlertMessage from "../alert/alert-message";

interface ModeCardProps {
  maintenance: boolean;
  onMaintenanceChange: (value: boolean) => void;
  isLoading?: boolean;
  isPending?: boolean;
  loader?: boolean;
}

export function ModeCard({
  maintenance,
  onMaintenanceChange,
  isLoading,
  isPending,
  loader = false,
}: ModeCardProps) {
  if (loader) {
    return (
      <div className="border p-4 border-input bg-white/80 dark:bg-neutral-900/30 rounded-md space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-56" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
          <Skeleton className="h-6 w-11 rounded-full shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "border p-4 border-input bg-white/80 dark:bg-neutral-900/30 rounded-md",
        {
          "border-amber-300 ring-[3px] ring-amber-400/20": maintenance,
        },
      )}
    >
      <Heading>Mode maintenance</Heading>
      <DetailField
        layout="row"
        label="Activer le mode maintenance"
        value="Met la plateforme hors ligne pour les utilisateurs. Les admins conservent l'accès."
      >
        <div className="flex items-end h-full gap-3">
          <Switch
            checked={maintenance}
            disabled={isLoading || isPending}
            onCheckedChange={onMaintenanceChange}
          />
        </div>
      </DetailField>
      {maintenance && (
        <AlertMessage
          type="info"
          title="Mode maintenance activé"
          description="La plateforme est actuellement inaccessible aux utilisateurs."
        />
      )}
    </div>
  );
}
