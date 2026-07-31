import { create } from "zustand";
import { persist } from "zustand/middleware";

type GeoTab = "countries" | "cities" | "currencies";

interface GeoManagerStore {
  activeTab: GeoTab;
  setActiveTab: (tab: GeoTab) => void;
}

export const useGeoManagerStore = create<GeoManagerStore>()(
  persist(
    (set) => ({
      activeTab: "countries",
      setActiveTab: (tab) => set({ activeTab: tab }),
    }),
    {
      name: "geo-manager-storage",
    },
  ),
);
