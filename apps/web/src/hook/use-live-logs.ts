import { useEffect, useState } from "react";
import type { ActivityLogPayload } from "@lokale/types/socket";
import { useRealtime } from "#/components/realtime/realtime";

interface UseLiveLogsOptions {
  /** Nombre max de logs gardés en mémoire côté client (évite une fuite mémoire sur un dashboard resté ouvert longtemps) */
  maxEntries?: number;
}

/**
 * S'abonne au flux de logs en direct (admin only — le serveur refuse le
 * join si le rôle n'est pas ADMIN). Retourne les logs les plus récents en
 * tête de liste, mis à jour au fil de l'eau, ainsi que le statut d'accès.
 */
export function useLiveLogs({ maxEntries = 200 }: UseLiveLogsOptions = {}) {
  const { socket, connected } = useRealtime();
  const [logs, setLogs] = useState<ActivityLogPayload[]>([]);
  const [access, setAccess] = useState<"pending" | "granted" | "denied">(
    "pending",
  );

  useEffect(() => {
    if (!connected) return;

    socket.emit("logs:subscribe", (ok) => {
      setAccess(ok ? "granted" : "denied");
    });

    const onNewLog = (payload: ActivityLogPayload) => {
      setLogs((prev) => [payload, ...prev].slice(0, maxEntries));
    };
    socket.on("log:new", onNewLog);

    return () => {
      socket.emit("logs:unsubscribe");
      socket.off("log:new", onNewLog);
    };
  }, [socket, connected, maxEntries]);

  return { logs, access };
}
