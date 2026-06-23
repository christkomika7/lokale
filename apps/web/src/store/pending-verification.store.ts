import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PendingVerificationStore {
  email: string | null;
  setEmail: (email: string) => void;
  clearEmail: () => void;
}

export const usePendingVerificationStore = create<PendingVerificationStore>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email) => set({ email }),
      clearEmail: () => set({ email: null }),
    }),
    {
      name: "lokale-pending-verification",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
