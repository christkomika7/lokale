import {
  Goal,
  Loader2,
  Map,
  Pencil,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { CITY_TYPE_LABELS } from "@lokale/config/localisation";

import type { City } from "@lokale/types/localisation";

import PanelIntro from "#/components/sheet/panel-intro";
import DetailField from "#/components/ui/detail-field";

interface CityDetailProps {
  city: City;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isDeleting?: boolean;
}

export default function CityDetail({
  city,
  onEdit,
  onDelete,
  onClose,
  isDeleting,
}: CityDetailProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro icon={Goal} title={city.name} onClose={onClose} />

      <div className="grid grid-cols-2 gap-2 p-4">
        <DetailField
          icon={Map}
          label="Région"
          value={city.region}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Users}
          label="Population"
          value={city.population?.toLocaleString("fr-FR") ?? "—"}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Tag}
          label="Type de ville"
          value={CITY_TYPE_LABELS[city.type]}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
      </div>
      <Separator className="dark:bg-neutral-800 shrink-0" />

      <div className="grid grid-cols-1 gap-2 p-4">
        <Button
          variant="amber"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onEdit}
          disabled={isDeleting}
        >
          <Pencil className="size-3.5" /> Modifier
        </Button>

        <Button
          variant="error"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onDelete}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}{" "}
          Supprimer
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-8 rounded-md gap-1.5"
          onClick={onClose}
          disabled={isDeleting}
        >
          <X /> Fermer
        </Button>
      </div>
    </div>
  );
}
