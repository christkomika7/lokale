import { Badge } from "#/components/ui/badge";
import { Loader2 } from "lucide-react";
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

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

interface BusinessesGridProps {
  businesses: Business[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedId: string | null;
  onOpen: (business: Business) => void;
}

export default function BusinessesGrid({
  businesses,
  isLoading,
  isFetching,
  selectedId,
  onOpen,
}: BusinessesGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-neutral-400">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="py-16 text-center text-[13px] text-neutral-400">
        Aucune entreprise trouvée.
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3 transition-opacity ${
        isFetching ? "opacity-60" : "opacity-100"
      }`}
    >
      {businesses.map((b) => (
        <button
          key={b.id}
          onClick={() => onOpen(b)}
          className={`text-left border rounded-lg p-4 transition-colors hover:border-amber-400 hover:ring-2 hover:ring-amber-500/20 ${
            selectedId === b.id
              ? "border-amber-400 ring-2 ring-amber-500/20"
              : "border-input dark:border-neutral-700"
          }`}
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="size-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 dark:text-amber-400 text-xs font-bold shrink-0">
              {initials(b.name)}
            </div>
            <Badge className={STATUS_BADGE[b.status]}>
              {STATUS_LABEL[b.status]}
            </Badge>
          </div>
          <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
            {b.name}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
            {b.category || "—"} · {b.city || "—"}
          </p>
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-2">
            {b._count?.publications ?? 0} publications ·{" "}
            {b._count?.actions ?? 0} actions
          </p>
        </button>
      ))}
    </div>
  );
}
