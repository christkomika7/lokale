import { useEffect, useState } from "react";
import { Lock, ShieldAlert } from "lucide-react";
import { getRemainingSeconds } from "@lokale/lib/date";
import { FlipClock } from "../ui/flip-clock";

interface BanDurationProps {
  banExpires?: string | Date | null;
  reason?: string | null;
  onBanEnd?: () => void;
  className?: string;
}

export function BanDuration({
  banExpires,
  reason,
  onBanEnd,
  className,
}: BanDurationProps) {
  const isPermanent = !banExpires;
  const [remaining, setRemaining] = useState(() =>
    banExpires ? getRemainingSeconds(banExpires) : 0,
  );

  useEffect(() => {
    if (isPermanent || !banExpires) return;

    setRemaining(getRemainingSeconds(banExpires));

    const interval = setInterval(() => {
      const left = getRemainingSeconds(banExpires);
      setRemaining(left);
      if (left <= 0) {
        clearInterval(interval);
        onBanEnd?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [banExpires, isPermanent, onBanEnd]);

  return (
    <div
      className={`flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 ${className ?? ""}`}
    >
      <div className="size-14 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
        {isPermanent ? (
          <Lock className="size-7 text-red-500" strokeWidth={1.5} />
        ) : (
          <ShieldAlert className="size-7 text-red-500" strokeWidth={1.5} />
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-[15px] font-bold text-red-700 dark:text-red-400">
          {isPermanent
            ? "Accès suspendu définitivement"
            : "Accès temporairement suspendu"}
        </h3>
        {reason && (
          <p className="text-[12px] text-red-500 dark:text-red-400/80">
            {reason}
          </p>
        )}
      </div>

      {!isPermanent && remaining > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] text-red-400 dark:text-red-400/70 uppercase tracking-wide font-semibold">
            Réessayez dans
          </p>
          <FlipClock seconds={remaining} />
        </div>
      )}
    </div>
  );
}
