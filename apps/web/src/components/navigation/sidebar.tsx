import { useState } from "react";
import type { TabKey } from "@lokale/types/navigation";
import type { LucideIcon } from "lucide-react";

import Container from "../layout/container";

export interface Tab {
  key: TabKey;
  label: string;
  icon: LucideIcon;
}

interface SidebarProps {
  tabs: Tab[];
  content: Record<TabKey, React.ReactNode>;
}

export function Sidebar({ tabs, content }: SidebarProps) {
  const [tab, setTab] = useState<TabKey>("general");

  const current = tabs.find((t) => t.key === tab)!;
  return (
    <div className="min-h-[calc(100vh-226px)] h-auto overflow-hidden pb-4">
      <Container className="flex gap-x-2">
        <div className="w-56 top-0 shrink-0 h-fit  flex flex-col overflow-y-auto">
          <p className="text-sm py-3 px-4 rounded-lg bg-secondary/50 dark:bg-neutral-700/30 font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-200 mb-2">
            Menu
          </p>
          <nav className="flex rounded-lg h-fit py-3 bg-secondary/50 dark:bg-neutral-700/30 flex-col gap-0.5 px-2">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={[
                    "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-colors text-left",
                    active
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-slate-50 dark:hover:bg-neutral-800 hover:text-neutral-800 dark:hover:text-neutral-100",
                  ].join(" ")}
                >
                  <Icon className="size-4 shrink-0" />
                  {t.label}
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex-1 h-full rounded-lg bg-secondary/50 dark:bg-neutral-700/30">
          <div className="px-4 py-3">
            <div className="mb-6">
              <div className="flex items-center gap-1">
                {<current.icon className="size-4 text-amber-500" />}
                <h1 className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                  {current.label}
                </h1>
              </div>
              <p className="text-[12px] text-neutral-400 dark:text-neutral-200">
                Configurez les paramètres de votre plateforme Lokale.
              </p>
            </div>
            {content[tab]}
          </div>
        </div>
      </Container>
    </div>
  );
}
