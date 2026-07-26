import { Button } from "#/components/ui/button";
import {
  Banknote,
  Flag,
  Globe2,
  Hash,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { Separator } from "#/components/ui/separator";

import type { Country } from "@lokale/types/localisation";

import PanelIntro from "#/components/sheet/panel-intro";
import DetailField from "#/components/ui/detail-field";

interface CountryDetailProps {
  country: Country;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
  isDeleting?: boolean;
}

export function CountryDetail({
  country,
  onEdit,
  onDelete,
  onClose,
  isDeleting,
}: CountryDetailProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelIntro
        icon={Flag}
        title={country.name}
        subtitle={
          country.cities.length +
          " ville" +
          (country.cities.length !== 1 ? "s" : "")
        }
        onClose={onClose}
      />
      <div className="grid grid-cols-2 gap-2 p-4">
        <DetailField
          icon={MapPin}
          label="Villes"
          value={
            country.cities.length +
            " ville" +
            (country.cities.length !== 1 ? "s" : "")
          }
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Hash}
          label="Code ISO"
          value={country.code}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Phone}
          label="Indicatif"
          value={country.phoneCode || "—"}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Globe2}
          label="Continent"
          value={country.continent || "—"}
          className=" bg-neutral-500/10 p-3 rounded-sm"
        />
        <DetailField
          icon={Banknote}
          label="Devise"
          value={country.currency.code}
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
