// Socket.io tourne sur un serveur HTTP dédié (port séparé), dans le MÊME
// process Bun que ton Elysia app. C'est l'approche la plus fiable avec Bun :
// l'intégration "attach direct sur Bun.serve()" de socket.io est encore
// expérimentale selon les versions, alors qu'un http.Server node-compat
// (que Bun supporte nativement) est stable à 100%.
//
// Ton front se connecte simplement sur un port différent (ex: 3001 à côté
// de ton API sur 3000), ou tu passes par un reverse-proxy en prod qui route
// /socket.io vers ce port.

import { createServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type {
  AuthedSocketUser,
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@lokale/types/socket";
import { rooms } from "./rooms";
import { auth } from "../../lib/auth";

export type AppSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Présence en mémoire. Pour du multi-instance (plusieurs process/serveurs),
// remplace cette Map par l'adapter Redis officiel de socket.io
// (@socket.io/redis-adapter) + un store de présence partagé (Redis aussi).
const onlineUsers = new Map<string, Set<string>>(); // userId -> set of socket ids

let ioInstance: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function getIO() {
  if (!ioInstance) {
    throw new Error(
      "Realtime server non initialisé. Appelle startRealtimeServer() au boot de ton app.",
    );
  }
  return ioInstance;
}

interface StartRealtimeServerOptions {
  port: number;
  corsOrigin: string | string[];
}

export function startRealtimeServer({
  port,
  corsOrigin,
}: StartRealtimeServerOptions) {
  const httpServer = createServer();

  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  // --- Authentification à la connexion ---
  // Le client passe le cookie de session Better Auth (credentials: true côté
  // client) ou un token dans `auth.token` du handshake. On vérifie via
  // Better Auth directement, pas de JWT maison à maintenir en double.
  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? "";
      const bearerToken = socket.handshake.auth?.token as string | undefined;

      const session = await auth.api.getSession({
        headers: new Headers({
          cookie: cookieHeader,
          ...(bearerToken ? { authorization: `Bearer ${bearerToken}` } : {}),
        }),
      });

      if (!session?.user) {
        return next(new Error("UNAUTHORIZED"));
      }

      const user: AuthedSocketUser = {
        id: session.user.id,
        role: (session.user as { role?: string }).role ?? "USER",
        name: session.user.name,
      };

      socket.data.user = user;
      next();
    } catch (err) {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (socket: AppSocket) => {
    const { user } = socket.data;

    // Chaque user rejoint automatiquement sa room perso : c'est là-dessus
    // qu'on lui envoie ses notifications, ses updates de ressources qu'il suit, etc.
    socket.join(rooms.user(user.id));

    // Présence
    if (!onlineUsers.has(user.id)) onlineUsers.set(user.id, new Set());
    onlineUsers.get(user.id)!.add(socket.id);
    if (onlineUsers.get(user.id)!.size === 1) {
      io.emit("presence:update", { userId: user.id, status: "online" });
    }

    // --- Rooms génériques (live sync sur n'importe quelle ressource) ---
    socket.on("room:join", (room, ack) => {
      socket.join(room);
      ack?.(true);
    });
    socket.on("room:leave", (room, ack) => {
      socket.leave(room);
      ack?.(true);
    });

    // --- Conversations ---
    socket.on("conversation:join", (conversationId) => {
      socket.join(rooms.conversation(conversationId));
    });
    socket.on("conversation:leave", (conversationId) => {
      socket.leave(rooms.conversation(conversationId));
    });
    socket.on("typing:start", (conversationId) => {
      socket.to(rooms.conversation(conversationId)).emit("typing:update", {
        conversationId,
        userId: user.id,
        isTyping: true,
      });
    });
    socket.on("typing:stop", (conversationId) => {
      socket.to(rooms.conversation(conversationId)).emit("typing:update", {
        conversationId,
        userId: user.id,
        isTyping: false,
      });
    });

    // --- Logs en direct (admin only) ---
    socket.on("logs:subscribe", (ack) => {
      if (user.role !== "ADMIN") {
        ack?.(false);
        return;
      }
      socket.join(rooms.logsLive());
      ack?.(true);
    });
    socket.on("logs:unsubscribe", () => {
      socket.leave(rooms.logsLive());
    });

    socket.on("disconnect", () => {
      const set = onlineUsers.get(user.id);
      set?.delete(socket.id);
      if (set && set.size === 0) {
        onlineUsers.delete(user.id);
        io.emit("presence:update", { userId: user.id, status: "offline" });
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`[realtime] socket.io en écoute sur le port ${port}`);
  });

  ioInstance = io;
  return io;
}

export function isUserOnline(userId: string) {
  return (onlineUsers.get(userId)?.size ?? 0) > 0;
}
