import { useCallback, useEffect, useRef, useState } from "react";
import { useCountdownStore } from "#/store/countdown.store";
import { formatTime } from "@lokale/lib/date";

interface UseCountdownOptions {
  key: string;
  initial: number;
}

interface UseCountdownReturn {
  remainingMs: number;
  seconds: number;
  formatted: string;
  canResend: boolean;
  start: () => void;
  restart: (durationMs?: number) => void;
}

export function useCountdown({
  key,
  initial,
}: UseCountdownOptions): UseCountdownReturn {
  const { setTimer, getRemaining, clearTimer } = useCountdownStore();
  const initialMs = initial * 1000;

  const [remainingMs, setRemainingMs] = useState<number>(() =>
    getRemaining(key),
  );

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    const rem = getRemaining(key);
    setRemainingMs(rem);
    if (rem <= 0) {
      clearTimer(key);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  }, [key]);

  function startInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(tick, 500);
  }

  useEffect(() => {
    const rem = getRemaining(key);
    setRemainingMs(rem);

    if (rem > 0) startInterval();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [key]);

  function start() {
    const existingRemaining = getRemaining(key);
    if (existingRemaining > 0) {
      setRemainingMs(existingRemaining);
      startInterval();
    }
  }

  function restart(durationMs = initialMs) {
    setTimer(key, durationMs);
    setRemainingMs(durationMs);
    startInterval();
  }

  return {
    remainingMs,
    seconds: Math.ceil(remainingMs / 1000),
    formatted: formatTime(remainingMs),
    canResend: remainingMs <= 0,
    start,
    restart,
  };
}
