import { Badge } from "#/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { ColumnDef } from "#/components/ui/data-table";
import type { Business } from "@lokale/types/business";

const STATUS_BADGE: Record<Business["status"], string> = {
  ACTIVE:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  PENDING:
    "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  SUSPENDED:
    "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  CLOSED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

const STATUS_LABEL: Record<Business["status"], string> = {
  ACTIVE: "Actif",
  PENDING: "En attente",
  SUSPENDED: "Suspendu",
  CLOSED: "Fermé",
};

export const businessColumns: ColumnDef<Business>[] = [
  {
    key: "business",
    label: "Entreprise",
    size: "2fr",
    render: (b) => (
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
          {b.name}
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
          {b.category || "—"} · {b.city || "—"}
        </p>
      </div>
    ),
  },
  {
    key: "owner",
    label: "Propriétaire",
    size: "1.5fr",
    render: (b) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate">
        {b.owner.name}
      </span>
    ),
  },
  {
    key: "status",
    label: "Statut",
    size: "1fr",
    render: (b) => (
      <Badge className={STATUS_BADGE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
    ),
  },
  {
    key: "activity",
    label: "Activité",
    size: "1fr",
    render: (b) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
        {b._count?.publications ?? 0} pub · {b._count?.actions ?? 0} actions
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
