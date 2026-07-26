import { createFileRoute, Outlet, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import {
  Flag,
  ShieldAlert,
  ScrollText,
  AlertTriangle,
  Bell,
  Megaphone,
} from "lucide-react";
import MonitoringMetric from "#/components/dashboard/monitoring/monitoring-metric";
import Container from "#/components/layout/container";

export const Route = createFileRoute("/(private)/admin/monitoring")({
  component: RouteComponent,
});

type TabKey =
  | "reports"
  | "sanctions"
  | "logs"
  | "suspicious"
  | "notifications"
  | "announcements";

function RouteComponent() {
  const [tab, setTab] = useState<TabKey>("reports");
  const router = useRouter();

  const TABS: {
    key: TabKey;
    label: string;
    path: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    {
      key: "reports",
      label: "Signalements",
      path: "/admin/monitoring",
      icon: Flag,
      count: 10,
    },
    {
      key: "sanctions",
      label: "Sanctions",
      path: "/admin/monitoring/sanctions",
      icon: ShieldAlert,
    },
    {
      key: "logs",
      label: "Logs système",
      path: "/admin/monitoring/logs",
      icon: ScrollText,
    },
    {
      key: "suspicious",
      label: "Activités suspectes",
      path: "/admin/monitoring/suspicious-activities",
      icon: AlertTriangle,
      count: 7,
    },
    {
      key: "notifications",
      label: "Notifications",
      path: "/admin/monitoring/notifications",
      icon: Bell,
      count: 8,
    },
    {
      key: "announcements",
      label: "Annonces",
      path: "/admin/monitoring/announcements",
      icon: Megaphone,
    },
  ];
  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      <MonitoringMetric />
      <div className="shrink-0 border-b border-input dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <Container>
          <div className="flex items-center gap-0">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  router.navigate({ to: t.path });
                }}
                className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors ${tab === t.key ? "text-amber-500 dark:text-amber-400" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"}`}
              >
                <t.icon className="size-3.5 shrink-0" />
                {t.label}
                {t.count !== undefined && t.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tab === t.key ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}
                  >
                    {t.count}
                  </span>
                )}
                {tab === t.key && (
                  <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-amber-400 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </Container>
      </div>
      <Outlet />
    </div>
  );
}
