import { Badge } from "#/components/ui/badge";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Ban, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/(private)/admin/monitoring/suspicious-activities",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [search, setSearch] = useState("");

  const filteredSuspicious = SUSPICIOUS.filter(
    (s) =>
      !search ||
      suspiciousCfg[s.type].label.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="p-6 space-y-3">
      {filteredSuspicious.map((sp) => {
        const cfg = suspiciousCfg[sp.type];
        return (
          <div
            key={sp.id}
            className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors ${sp.resolved ? "border-input dark:border-neutral-700 opacity-60" : "border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${sp.resolved ? "bg-slate-100 dark:bg-neutral-800" : "bg-red-100 dark:bg-red-500/10"}`}
              >
                <AlertTriangle
                  className={`size-4 ${sp.resolved ? "text-neutral-400" : "text-red-500"}`}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200">
                    {cfg.label}
                  </p>
                  <Badge
                    className={
                      sp.resolved
                        ? "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400"
                        : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                    }
                  >
                    {sp.resolved ? "Résolu" : "Actif"}
                  </Badge>
                </div>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                  {cfg.desc}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    {sp.source}
                  </span>
                  {sp.user && (
                    <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                      · {sp.user}
                    </span>
                  )}
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    · {sp.count} occurrence{sp.count > 1 ? "s" : ""}
                  </span>
                  <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    · {sp.date}
                  </span>
                </div>
              </div>
            </div>
            {!sp.resolved && (
              <div className="flex items-center gap-2 shrink-0">
                {iconBtn(
                  "Bloquer l'IP",
                  "text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10",
                  <Ban className="size-3.5" />,
                  () => toast.error("IP bloquée."),
                )}
                {iconBtn(
                  "Marquer résolu",
                  "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
                  <CheckCircle2 className="size-3.5" />,
                  () => toast.success("Marqué comme résolu."),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

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

type SuspiciousActivity = {
  id: string;
  type: SuspiciousType;
  source: string;
  user?: string;
  count: number;
  date: string;
  resolved: boolean;
};

type SuspiciousType =
  | "brute_force"
  | "unusual_api"
  | "mass_action"
  | "geo_anomaly";

const suspiciousCfg: Record<SuspiciousType, { label: string; desc: string }> = {
  brute_force: {
    label: "Force brute",
    desc: "Tentatives de connexion répétées",
  },
  unusual_api: {
    label: "API inhabituelle",
    desc: "Requêtes API anormales détectées",
  },
  mass_action: {
    label: "Action de masse",
    desc: "Actions en volume inhabituelles",
  },
  geo_anomaly: {
    label: "Anomalie géographique",
    desc: "Connexion depuis une zone inhabituelle",
  },
};

const SUSPICIOUS: SuspiciousActivity[] = [
  {
    id: "sp1",
    type: "brute_force",
    source: "102.244.51.8",
    user: "admin@awa.cg",
    count: 14,
    date: "Il y a 2h",
    resolved: false,
  },
  {
    id: "sp2",
    type: "unusual_api",
    source: "41.202.100.8",
    user: undefined,
    count: 3,
    date: "Il y a 5h",
    resolved: false,
  },
  {
    id: "sp3",
    type: "mass_action",
    source: "197.243.80.1",
    user: "Utilisateur #8821",
    count: 8,
    date: "Il y a 1j",
    resolved: true,
  },
  {
    id: "sp4",
    type: "geo_anomaly",
    source: "185.220.101.5",
    user: "Rodrigue Bokamba",
    count: 1,
    date: "Il y a 2j",
    resolved: true,
  },
];
