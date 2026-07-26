import { Badge } from "#/components/ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import {
  LogIn,
  Server,
  Settings,
  Shield,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(private)/admin/monitoring/logs")({
  component: RouteComponent,
});

function RouteComponent() {
  const [levelFilter, setLevel] = useState<LogLevel | "all">("all");
  const [catFilter, setCat] = useState<LogCategory | "all">("all");
  const [search, setSearch] = useState("");
  const filteredLogs = SYSTEM_LOGS.filter((l) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        l.message.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q)) &&
      (levelFilter === "all" || l.level === levelFilter) &&
      (catFilter === "all" || l.category === catFilter)
    );
  });

  return (
    <div className="flex-1">
      <div className="px-6 py-2.5 grid grid-cols-[0.6fr_0.8fr_2fr_1.2fr_1.2fr_1fr] gap-3 border-b border-input dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/80 sticky top-0 z-10">
        {["Niveau", "Catégorie", "Message", "Acteur", "Cible", "Date"].map(
          (h) => (
            <p
              key={h}
              className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
            >
              {h}
            </p>
          ),
        )}
      </div>
      <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
        {filteredLogs.map((l) => {
          const lv = logLevelCfg[l.level];
          const cat = logCategoryCfg[l.category];
          return (
            <div
              key={l.id}
              className={`px-6 py-3 grid grid-cols-[0.6fr_0.8fr_2fr_1.2fr_1.2fr_1fr] gap-3 items-center hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors ${l.level === "critical" ? "border-l-2 border-red-400" : "border-l-2 border-transparent"}`}
            >
              <div className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full shrink-0 ${lv.dot}`} />
                <Badge className={lv.badge}>{lv.label}</Badge>
              </div>
              <Badge className="bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-300 self-start">
                {cat.icon}
                {cat.label}
              </Badge>
              <p className="text-[12px] text-neutral-700 dark:text-neutral-200 truncate">
                {l.message}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                {l.actor}
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate font-mono">
                {l.target}
              </p>
              <div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {l.date}
                </p>
                <p className="text-[10px] text-neutral-300 dark:text-neutral-600 font-mono">
                  {l.ip}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

type LogLevel = "info" | "warning" | "error" | "critical";
type LogCategory =
  | "auth"
  | "admin"
  | "permission"
  | "deletion"
  | "server"
  | "modification";

type SystemLog = {
  id: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  actor: string;
  target: string;
  ip: string;
  date: string;
};

const SYSTEM_LOGS: SystemLog[] = [
  {
    id: "l1",
    level: "critical",
    category: "admin",
    message: "Clé API production régénérée",
    actor: "Super Admin",
    target: "API Key — Production",
    ip: "197.243.12.4",
    date: "2025-01-10 16:30",
  },
  {
    id: "l2",
    level: "warning",
    category: "auth",
    message: "10 tentatives de connexion échouées",
    actor: "Inconnu",
    target: "admin@awa.cg",
    ip: "102.244.51.8",
    date: "2025-01-10 15:44",
  },
  {
    id: "l3",
    level: "info",
    category: "admin",
    message: "Utilisateur suspendu",
    actor: "Super Admin",
    target: "Arlette Massamba (#u3)",
    ip: "197.243.12.4",
    date: "2025-01-10 14:32",
  },
  {
    id: "l4",
    level: "info",
    category: "modification",
    message: "Paramètres SMTP mis à jour",
    actor: "Super Admin",
    target: "Serveur mail production",
    ip: "197.243.12.4",
    date: "2025-01-09 18:44",
  },
  {
    id: "l5",
    level: "error",
    category: "server",
    message: "Timeout base de données — 3 requêtes abandonnées",
    actor: "Système",
    target: "DB Production",
    ip: "—",
    date: "2025-01-09 14:12",
  },
  {
    id: "l6",
    level: "info",
    category: "deletion",
    message: "Contenu supprimé par modérateur",
    actor: "Modérateur #1",
    target: "Commentaire #c5 — spam",
    ip: "41.202.200.1",
    date: "2025-01-09 10:22",
  },
  {
    id: "l7",
    level: "warning",
    category: "permission",
    message: "Tentative accès route non autorisée",
    actor: "Utilisateur #44",
    target: "/admin/settings",
    ip: "41.202.219.14",
    date: "2025-01-08 22:10",
  },
  {
    id: "l8",
    level: "info",
    category: "auth",
    message: "Connexion admin réussie",
    actor: "Super Admin",
    target: "Session #s1",
    ip: "197.243.12.4",
    date: "2025-01-08 08:05",
  },
  {
    id: "l9",
    level: "critical",
    category: "server",
    message: "Erreur 500 — endpoint /api/payments",
    actor: "Système",
    target: "POST /api/payments/webhook",
    ip: "—",
    date: "2025-01-07 19:33",
  },
  {
    id: "l10",
    level: "info",
    category: "admin",
    message: "Mode maintenance activé",
    actor: "Super Admin",
    target: "Plateforme entière",
    ip: "197.243.12.4",
    date: "2025-01-07 22:00",
  },
];

const logLevelCfg: Record<
  LogLevel,
  { label: string; badge: string; dot: string }
> = {
  info: {
    label: "Info",
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-400",
  },
  warning: {
    label: "Warning",
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  error: {
    label: "Erreur",
    badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    dot: "bg-red-500",
  },
  critical: {
    label: "Critique",
    badge:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 font-semibold",
    dot: "bg-red-600",
  },
};

const logCategoryCfg: Record<
  LogCategory,
  { label: string; icon: React.ReactNode }
> = {
  auth: { label: "Authentification", icon: <LogIn className="size-3.5" /> },
  admin: { label: "Action admin", icon: <Shield className="size-3.5" /> },
  permission: {
    label: "Permission",
    icon: <ShieldAlert className="size-3.5" />,
  },
  deletion: { label: "Suppression", icon: <Trash2 className="size-3.5" /> },
  server: { label: "Serveur", icon: <Server className="size-3.5" /> },
  modification: {
    label: "Modification",
    icon: <Settings className="size-3.5" />,
  },
};
