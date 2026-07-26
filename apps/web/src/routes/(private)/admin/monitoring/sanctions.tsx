import { Badge } from "#/components/ui/badge";
import { initials } from "#/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import { Ban, Bell, Eye, RefreshCw, Trash2, UserX } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(private)/admin/monitoring/sanctions")({
  component: RouteComponent,
});

function RouteComponent() {
  const [search, setSearch] = useState("");
  const filteredSanctions = SANCTIONS.filter(
    (s) => !search || s.user.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="flex-1">
      <div className="px-6 py-2.5 grid grid-cols-[2fr_1fr_2fr_1.2fr_0.8fr_70px] gap-3 border-b border-input dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/80 sticky top-0 z-10">
        {[
          "Utilisateur",
          "Sanction",
          "Raison",
          "Prononcé par",
          "Statut",
          "",
        ].map((h) => (
          <p
            key={h}
            className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
          >
            {h}
          </p>
        ))}
      </div>
      <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
        {filteredSanctions.map((s) => {
          const sc = sanctionCfg[s.type];
          return (
            <div
              key={s.id}
              className="px-6 py-3.5 grid grid-cols-[2fr_1fr_2fr_1.2fr_0.8fr_70px] gap-3 items-center hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-7 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-500 dark:text-red-400 shrink-0">
                  {initials(s.user)}
                </div>
                <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                  {s.user}
                </p>
              </div>
              <Badge className={sc.badge}>
                {sc.icon}
                {sc.label}
              </Badge>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate">
                {s.reason}
              </p>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                {s.admin}
              </p>
              <Badge
                className={
                  s.active
                    ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    : "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400"
                }
              >
                {s.active ? "Active" : "Levée"}
              </Badge>
              <div className="flex items-center gap-1">
                {iconBtn(
                  "Voir",
                  "text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800",
                  <Eye className="size-3.5" />,
                )}
                {s.active &&
                  iconBtn(
                    "Lever",
                    "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
                    <RefreshCw className="size-3.5" />,
                    () => toast.success("Sanction levée."),
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const sanctionCfg: Record<
  SanctionType,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  warning: {
    label: "Avertissement",
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    icon: <Bell className="size-3" />,
  },
  suspension: {
    label: "Suspension",
    badge:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    icon: <UserX className="size-3" />,
  },
  ban: {
    label: "Bannissement",
    badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    icon: <Ban className="size-3" />,
  },
  deletion: {
    label: "Suppression",
    badge:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    icon: <Trash2 className="size-3" />,
  },
};

const SANCTIONS: Sanction[] = [
  {
    id: "s1",
    user: "Arlette Massamba",
    type: "suspension",
    reason: "Harcèlement répété malgré avertissement",
    admin: "Super Admin",
    date: "2025-01-09 18:30",
    active: true,
  },
  {
    id: "s2",
    user: "Christelle Loemba",
    type: "ban",
    reason: "Spam massif et création de faux comptes",
    admin: "Super Admin",
    date: "2025-01-08 12:00",
    active: true,
  },
  {
    id: "s3",
    user: "Utilisateur #8821",
    type: "warning",
    reason: "Contenu trompeur — première infraction",
    admin: "Modérateur #1",
    date: "2025-01-07 10:15",
    active: false,
  },
  {
    id: "s4",
    user: "Patrick Elenga",
    type: "deletion",
    reason: "Vidéo frauduleuse supprimée du compte",
    admin: "Modérateur #2",
    date: "2025-01-06 14:22",
    active: false,
  },
  {
    id: "s5",
    user: "Utilisateur #3318",
    type: "warning",
    reason: "Publication offre emploi non conforme",
    admin: "Super Admin",
    date: "2025-01-05 09:40",
    active: true,
  },
];

type SanctionType = "warning" | "suspension" | "ban" | "deletion";

type Sanction = {
  id: string;
  user: string;
  type: SanctionType;
  reason: string;
  admin: string;
  date: string;
  active: boolean;
};

function iconBtn(
  title: string,
  colorCls: string,
  icon: React.ReactNode,
  onClick?: () => void,
) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-7 rounded-lg flex items-center justify-center transition-colors ${colorCls}`}
    >
      {icon}
    </button>
  );
}
