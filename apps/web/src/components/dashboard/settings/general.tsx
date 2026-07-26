import { ModeCard } from "#/components/card/mode-card";
import { api } from "./lib/api";

export default function General() {
  const { data: system, isLoading } = api.getSystem();
  const { mutate: updateSystem, isPending } = api.updateSystem();

  const maintenance = system?.maintenance ?? false;

  return (
    <ModeCard
      maintenance={maintenance}
      isLoading={isLoading}
      isPending={isPending}
      loader={isLoading}
      onMaintenanceChange={(v) => updateSystem({ maintenance: v })}
    />
  );
}
