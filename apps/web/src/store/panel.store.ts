import { create } from "zustand";

interface PanelDialogStore {
  isDialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
}

export const usePanelDialogStore = create<PanelDialogStore>()((set) => ({
  isDialogOpen: false,
  setDialogOpen: (open) => set({ isDialogOpen: open }),
}));
