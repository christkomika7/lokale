import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface FlipUnitProps {
  value: number;
  label: string;
}

function DigitFace({
  display,
  half,
}: {
  display: string;
  half: "top" | "bottom";
}) {
  return (
    <div
      className={`absolute inset-x-0 h-1/2 overflow-hidden ${
        half === "top"
          ? "top-0 rounded-t-[10px] bg-linear-to-b from-neutral-800 to-neutral-900"
          : "bottom-0 rounded-b-[10px] bg-linear-to-b from-neutral-950 to-neutral-900"
      }`}
    >
      <div
        className="absolute inset-x-0 h-[64px] flex items-center justify-center text-[28px] font-bold text-white tabular-nums"
        style={{ top: half === "top" ? 0 : "-32px" }}
      >
        {display}
      </div>
    </div>
  );
}

function FlipUnit({ value, label }: FlipUnitProps) {
  const display = value.toString().padStart(2, "0");
  const [prevDisplay, setPrevDisplay] = useState(display);
  const [flipping, setFlipping] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (display === prevDisplay) return;

    setFlipping(true);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setPrevDisplay(display);
      setFlipping(false);
    }, 480);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [display, prevDisplay]);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className="relative w-[54px] h-[64px] rounded-[10px] shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
        style={{ perspective: "260px" }}
      >
        <DigitFace display={display} half="top" />
        <DigitFace display={flipping ? prevDisplay : display} half="bottom" />

        <AnimatePresence>
          {flipping && (
            <>
              <motion.div
                key={`upper-${display}`}
                className="absolute inset-x-0 top-0 h-1/2 overflow-hidden rounded-t-[10px] bg-linear-to-b from-neutral-800 to-neutral-900"
                style={{
                  transformOrigin: "bottom center",
                  backfaceVisibility: "hidden",
                }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -90 }}
                transition={{ duration: 0.26, ease: [0.45, 0, 0.55, 1] }}
              >
                <div
                  className="absolute inset-x-0 h-[64px] flex items-center justify-center text-[28px] font-bold text-white tabular-nums"
                  style={{ top: 0 }}
                >
                  {prevDisplay}
                </div>
                <div className="absolute inset-x-0 bottom-0 h-3 bg-linear-to-b from-transparent to-black/40" />
              </motion.div>

              <motion.div
                key={`lower-${display}`}
                className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden rounded-b-[10px] bg-linear-to-b from-neutral-950 to-neutral-900"
                style={{
                  transformOrigin: "top center",
                  backfaceVisibility: "hidden",
                }}
                initial={{ rotateX: 90 }}
                animate={{ rotateX: 0 }}
                transition={{
                  duration: 0.26,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.2,
                }}
              >
                <div
                  className="absolute inset-x-0 h-[64px] flex items-center justify-center text-[28px] font-bold text-white tabular-nums"
                  style={{ top: "-32px" }}
                >
                  {display}
                </div>
                <div className="absolute inset-x-0 top-0 h-3 bg-linear-to-t from-transparent to-black/30" />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none">
          <div className="h-[3px] bg-black/60" />
          <div className="h-px bg-white/5" />
        </div>
      </div>
      <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

interface FlipClockProps {
  seconds: number;
  showDays?: boolean;
  className?: string;
}

export function FlipClock({
  seconds,
  showDays = true,
  className,
}: FlipClockProps) {
  const safeSeconds = Math.max(0, Math.floor(seconds));

  const days = Math.floor(safeSeconds / 86400);
  const hours = Math.floor((safeSeconds % 86400) / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const secs = safeSeconds % 60;

  const units: { value: number; label: string }[] = [];
  if (showDays && days > 0) units.push({ value: days, label: "jours" });
  if (days > 0 || hours > 0) units.push({ value: hours, label: "heures" });
  units.push({ value: minutes, label: "min" });
  units.push({ value: secs, label: "sec" });

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {units.map((unit, i) => (
        <div key={unit.label} className="flex items-center gap-2">
          <FlipUnit value={unit.value} label={unit.label} />
          {i < units.length - 1 && (
            <span className="text-[20px] font-bold text-neutral-300 dark:text-neutral-600 -mt-4">
              :
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
