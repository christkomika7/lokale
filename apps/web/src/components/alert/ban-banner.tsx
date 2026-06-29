import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShieldAlert, X } from "lucide-react";
import { useBanStore } from "#/store/ban.store";
import { formatRemaining } from "@lokale/lib/date";

export function BanBanner() {
  const banInfo = useBanStore((s) => s.banInfo);
  const dismissed = useBanStore((s) => s.dismissed);
  const dismiss = useBanStore((s) => s.dismiss);
  const clearBan = useBanStore((s) => s.clearBan);

  const [remaining, setRemaining] = useState<string | null>(null);

  useEffect(() => {
    if (!banInfo || banInfo.permanent || !banInfo.banExpires) return;

    setRemaining(formatRemaining(banInfo.banExpires));

    const interval = setInterval(() => {
      const expiresAt = new Date(banInfo.banExpires!).getTime();
      if (expiresAt <= Date.now()) {
        clearBan();
        clearInterval(interval);
        return;
      }
      setRemaining(formatRemaining(banInfo.banExpires!));
    }, 1000);

    return () => clearInterval(interval);
  }, [banInfo, clearBan]);

  const visible = !!banInfo && !dismissed;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-0 inset-x-0 z-100"
        >
          <div className="relative bg-red-500/10 backdrop-blur-lg">
            <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3">
              <span className="size-7 rounded-lg bg-red-100 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <ShieldAlert className="size-3.5 text-red-500" />
              </span>
              <p className="text-[12px] sm:text-[13px] font-medium text-red-700 dark:text-red-400 text-center sm:text-left min-w-0">
                {banInfo!.permanent
                  ? "Votre accès a été suspendu définitivement."
                  : `Accès suspendu. Réessayez dans ${remaining}.`}
                {banInfo!.reason && (
                  <span className="hidden sm:inline text-red-500/70 dark:text-red-400/70">
                    {" "}
                    — {banInfo!.reason}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full h-7 w-10 rounded-b-md bg-red-500/10 backdrop-blur-lg flex items-center justify-center text-red-500/70 hover:text-red-600 hover:bg-red-100/60 dark:text-red-400/70 dark:hover:bg-red-500/10 transition-colors"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
