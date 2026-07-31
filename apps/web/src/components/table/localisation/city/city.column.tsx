import { Badge } from "#/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { ColumnDef } from "#/components/ui/data-table";
import type { City } from "@lokale/types/localisation";
import { CITY_TYPE_LABELS } from "@lokale/config/localisation";

export const cityColumns: ColumnDef<City>[] = [
  {
    key: "city",
    label: "Ville",
    size: "2fr",
    render: (city) => (
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
          {city.name}
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          {city.region || "—"}
        </p>
      </div>
    ),
  },
  {
    key: "country",
    label: "Pays",
    size: "1.5fr",
    render: (city) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
        {city.country.name} ({city.country.code})
      </span>
    ),
  },
  {
    key: "type",
    label: "Type",
    size: "1fr",
    render: (city) => (
      <Badge variant="info">{CITY_TYPE_LABELS[city.type]}</Badge>
    ),
  },
  {
    key: "population",
    label: "Population",
    size: "1fr",
    render: (city) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
        {city.population ? city.population.toLocaleString("fr-FR") : "—"}
      </span>
    ),
  },
  {
    key: "action",
    label: "Action",
    size: "0.5fr",
    render: () => (
      <span className="flex items-center gap-1 text-[12px] text-neutral-500 dark:text-neutral-400">
        <ChevronRight className="size-3" />
      </span>
    ),
  },
];
