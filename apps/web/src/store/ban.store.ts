import { create } from "zustand";

export interface BanInfo {
  permanent: boolean;
  reason: string | null;
  banExpires: string | null;
}

interface BanStore {
  banInfo: BanInfo | null;
  dismissed: boolean;
  setBan: (info: BanInfo) => void;
  clearBan: () => void;
  dismiss: () => void;
}

export const useBanStore = create<BanStore>((set) => ({
  banInfo: null,
  dismissed: false,
  setBan: (info) => set({ banInfo: info, dismissed: false }),
  clearBan: () => set({ banInfo: null, dismissed: false }),
  dismiss: () => set({ dismissed: true }),
}));
