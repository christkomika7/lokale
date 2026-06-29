import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import type { ColumnDef } from "#/components/ui/data-table";
import EmptyData from "#/components/ui/empty-data";
import { planCfg, roleCfg, statusCfg } from "#/config/admin/user";
import { initials } from "#/lib/utils";
import { formatDate } from "@lokale/lib/date";
import type { User } from "@lokale/types/user";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  XCircle,
} from "lucide-react";

export const columns: ColumnDef<User>[] = [
  {
    key: "user",
    label: "Utilisateur",
    size: "2fr",
    render: (user) => {
      const s = statusCfg[user.status];
      return (
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <Avatar className="size-8">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 text-xs font-bold">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white dark:border-neutral-900 ${s?.dot}`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                {user.name}
              </p>
              {user.suspiciousActivity && (
                <AlertTriangle className="size-3 text-red-400 shrink-0" />
              )}
            </div>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 flex">
              {user.city || <EmptyData length={6} />}
              {user.city && user.country && ", "}
              {user.country || <EmptyData length={6} />}
            </p>
          </div>
        </div>
      );
    },
  },
  {
    key: "contact",
    label: "Contact",
    size: "1.5fr",
    render: (user) => (
      <div>
        <p className="text-[12px] text-neutral-600 dark:text-neutral-300 truncate">
          {user.email}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          {user.emailVerified ? (
            <CheckCircle2 className="size-3 text-emerald-500" />
          ) : (
            <XCircle className="size-3 text-red-400" />
          )}
          <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
            {formatDate(user.lastSeen, true)}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Statut",
    size: "1fr",
    render: (user) => {
      const s = statusCfg[user.status];
      return (
        <Badge className={s.badge}>
          <span className={`size-1.5 rounded-full mr-1 ${s?.dot}`} />
          {s.label}
        </Badge>
      );
    },
  },
  {
    key: "role",
    label: "Rôle",
    size: "1fr",
    render: (user) => {
      const r = roleCfg[user.role];
      return <Badge className={r.badge}>{r.label}</Badge>;
    },
  },
  {
    key: "plan",
    label: "Plan",
    size: "1fr",
    render: (user) => {
      const p = planCfg[user.plan];
      return <Badge className={p.badge}>{p.label}</Badge>;
    },
  },
  {
    key: "actions",
    label: "Actions",
    size: "80px",
    render: (user) => (
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400">
          {user.actions.toLocaleString("fr-FR")}
        </span>
        <ChevronRight className="size-4 text-neutral-300 dark:text-neutral-600" />
      </div>
    ),
  },
];
