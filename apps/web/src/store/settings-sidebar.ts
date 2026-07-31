import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TabKey } from "@lokale/types/navigation";

interface SettingsSidebarStore {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
}

export const useSettingsSidebarStore = create<SettingsSidebarStore>()(
  persist(
    (set) => ({
      activeTab: "general",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "settings-sidebar-storage",
    },
  ),
);
