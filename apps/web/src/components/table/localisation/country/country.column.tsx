import { Badge } from "#/components/ui/badge";
import { ChevronRight, MapPin } from "lucide-react";
import type { ColumnDef } from "#/components/ui/data-table";
import type { Country } from "@lokale/types/localisation";

export const countryColumns: ColumnDef<Country>[] = [
  {
    key: "country",
    label: "Pays",
    size: "2fr",
    render: (country) => (
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
          {country.name}
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
          {country.code} · {country.continent || "—"}
        </p>
      </div>
    ),
  },
  {
    key: "phoneCode",
    label: "Indicatif",
    size: "1fr",
    render: (country) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
        {country.phoneCode || "—"}
      </span>
    ),
  },
  {
    key: "currency",
    label: "Devise",
    size: "1fr",
    render: (country) => (
      <Badge className="bg-neutral-100 text-neutral-500 dark:bg-neutral-700/50 dark:text-neutral-400">
        {country.currency.code}
      </Badge>
    ),
  },
  {
    key: "cities",
    label: "Villes",
    size: "1fr",
    render: (country) => (
      <span className="flex items-center gap-1 text-[12px] text-neutral-500 dark:text-neutral-400">
        <MapPin className="size-3" />
        {country.cities.length}
      </span>
    ),
  },
  {
    key: "action",
    label: "Action",
    size: "1fr",
    render: () => (
      <span className="flex items-center gap-1 text-[12px] text-neutral-500 dark:text-neutral-400">
        <ChevronRight className="size-3" />
      </span>
    ),
  },
];
