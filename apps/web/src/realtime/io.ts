import { io, type Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@lokale/types/socket";

export type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface CreateRealtimeClientOptions {
  url: string; // ex: "http://localhost:3001" ou ton domaine ws en prod
  getToken?: () => string | undefined; // optionnel si tu utilises un bearer token en plus du cookie
}

let socket: AppSocket | null = null;

/**
 * Singleton volontaire : une seule connexion websocket pour toute l'app,
 * peu importe combien de composants utilisent useRealtime(). Pas de
 * "contexte global" au sens store applicatif — juste une connexion réseau
 * partagée, ce qui est l'usage normal d'un client socket.io.
 */
export function getRealtimeClient(
  options?: CreateRealtimeClientOptions,
): AppSocket {
  if (socket) return socket;
  if (!options) {
    throw new Error(
      "getRealtimeClient() doit être initialisé avec des options la première fois.",
    );
  }

  socket = io(options.url, {
    withCredentials: true, // envoie le cookie de session Better Auth
    auth: options.getToken ? { token: options.getToken() } : undefined,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  });

  return socket;
}

export function disconnectRealtimeClient() {
  socket?.disconnect();
  socket = null;
}
