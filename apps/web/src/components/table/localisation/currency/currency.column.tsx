import { Badge } from "#/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { ColumnDef } from "#/components/ui/data-table";
import type { Currency } from "@lokale/types/localisation";

export const currencyColumns: ColumnDef<Currency>[] = [
  {
    key: "currency",
    label: "Nom",
    size: "2fr",
    render: (currency) => (
      <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
        {currency.name}
      </p>
    ),
  },
  {
    key: "code",
    label: "Code",
    size: "1fr",
    render: (currency) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
        {currency.code}
      </span>
    ),
  },
  {
    key: "symbol",
    label: "Symbole",
    size: "1fr",
    render: (currency) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
        {currency.symbol || "—"}
      </span>
    ),
  },
  {
    key: "countries",
    label: "Pays",
    size: "1fr",
    render: (currency) => (
      <Badge variant="info" className="min-w-10">
        {currency._count?.countries ?? 0}
      </Badge>
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
