import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CountdownEntry {
  endsAt: number;
}

interface CountdownStore {
  timers: Record<string, CountdownEntry>;
  setTimer: (key: string, durationMs: number) => void;
  getRemaining: (key: string) => number;
  clearTimer: (key: string) => void;
}

export const useCountdownStore = create<CountdownStore>()(
  persist(
    (set, get) => ({
      timers: {},

      setTimer: (key, durationMs) => {
        const endsAt = Date.now() + durationMs;
        set((state) => ({
          timers: { ...state.timers, [key]: { endsAt } },
        }));
      },

      getRemaining: (key) => {
        const entry = get().timers[key];
        if (!entry) return 0;
        return Math.max(0, entry.endsAt - Date.now());
      },

      clearTimer: (key) => {
        set((state) => {
          const { [key]: _, ...rest } = state.timers;
          return { timers: rest };
        });
      },
    }),
    {
      name: "lokale-countdowns",
      partialize: (state) => ({
        timers: Object.fromEntries(
          Object.entries(state.timers).filter(([, v]) => v.endsAt > Date.now()),
        ),
      }),
    },
  ),
);
