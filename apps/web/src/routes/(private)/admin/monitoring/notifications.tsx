import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  CheckCircle2,
  FileText,
  Flag,
  Server,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/(private)/admin/monitoring/notifications",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [search, setSearch] = useState("");
  const [notifFilter, setNotifFilter] = useState<NotifType | "all">("all");
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const filteredNotifs = notifications.filter(
    (n) =>
      (!search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())) &&
      (notifFilter === "all" || n.type === notifFilter),
  );

  function markRead(id: string) {
    setNotifications((n) =>
      n.map((x) => (x.id === id ? { ...x, read: true } : x)),
    );
  }
  function deleteNotif(id: string) {
    setNotifications((n) => n.filter((x) => x.id !== id));
  }

  return (
    <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
      {filteredNotifs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <Bell className="size-10 opacity-30 mb-3" />
          <p className="text-sm">Aucune notification</p>
        </div>
      )}
      {filteredNotifs.map((n) => {
        const t = notifTypeCfg[n.type];
        const p = priorityCfg[n.priority];
        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 px-6 py-4 hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors ${!n.read ? "bg-blue-50/20 dark:bg-blue-500/5" : ""}`}
            onClick={() => markRead(n.id)}
          >
            <div
              className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${t.color}`}
            >
              {t.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p
                  className={`text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate ${!n.read ? "font-semibold" : ""}`}
                >
                  {n.title}
                </p>
                {!n.read && (
                  <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                )}
                <span className={`size-2 rounded-full shrink-0 ${p.dot}`} />
              </div>
              <p className="text-[12px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                {n.message}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                {n.date}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!n.read &&
                iconBtn(
                  "Marquer lu",
                  "text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10",
                  <CheckCircle2 className="size-3.5" />,
                  () => markRead(n.id),
                )}
              {iconBtn(
                "Supprimer",
                "text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10",
                <Trash2 className="size-3.5" />,
                () => deleteNotif(n.id),
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type NotifType = "system" | "moderation" | "payment" | "user" | "security";

const notifTypeCfg: Record<
  NotifType,
  { icon: React.ReactNode; color: string }
> = {
  system: {
    icon: <Server className="size-4" />,
    color: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
  },
  moderation: {
    icon: <Flag className="size-4" />,
    color:
      "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400",
  },
  payment: {
    icon: <FileText className="size-4" />,
    color:
      "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  user: {
    icon: <Users className="size-4" />,
    color:
      "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400",
  },
  security: {
    icon: <ShieldAlert className="size-4" />,
    color: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
  },
};

const priorityCfg: Record<"low" | "medium" | "high", { dot: string }> = {
  low: { dot: "bg-slate-300 dark:bg-neutral-600" },
  medium: { dot: "bg-amber-400" },
  high: { dot: "bg-red-500" },
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

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "security",
    title: "Tentative de connexion suspecte",
    message: "14 tentatives depuis 102.244.51.8 sur admin@awa.cg",
    date: "Il y a 2h",
    read: false,
    priority: "high",
    actionUrl: "/admin/moderation",
  },
  {
    id: "n2",
    type: "moderation",
    title: "4 signalements en attente",
    message: "Des contenus signalés nécessitent votre attention",
    date: "Il y a 3h",
    read: false,
    priority: "high",
    actionUrl: "/admin/moderation",
  },
  {
    id: "n3",
    type: "payment",
    title: "Transaction échouée",
    message: "TXN-9838 — Supermarché Géant — 25 000 FCFA",
    date: "Il y a 5h",
    read: false,
    priority: "medium",
  },
  {
    id: "n4",
    type: "system",
    title: "Erreur serveur critique",
    message: "Timeout sur POST /api/payments/webhook — 3 requêtes perdues",
    date: "Il y a 6h",
    read: true,
    priority: "high",
  },
  {
    id: "n5",
    type: "user",
    title: "Nouveau signalement reçu",
    message: "Mireille Nganga a signalé une vidéo sur Hôtel Azur Palace",
    date: "Il y a 8h",
    read: true,
    priority: "medium",
  },
  {
    id: "n6",
    type: "moderation",
    title: "Workspace en attente de validation",
    message: "Hôtel Azur Palace attend votre validation depuis 2 jours",
    date: "Il y a 1j",
    read: true,
    priority: "medium",
  },
  {
    id: "n7",
    type: "system",
    title: "Sauvegarde automatique réussie",
    message: "Backup quotidien effectué — 34.2 Go archivés",
    date: "Il y a 1j",
    read: true,
    priority: "low",
  },
  {
    id: "n8",
    type: "payment",
    title: "Remboursement en attente de traitement",
    message: "TXN-9821 — Pharmacie Centrale — 25 000 FCFA — en attente admin",
    date: "Il y a 2j",
    read: true,
    priority: "medium",
  },
];
