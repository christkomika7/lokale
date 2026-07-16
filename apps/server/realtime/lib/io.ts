import { Server as Engine } from "@socket.io/bun-engine";
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

const onlineUsers = new Map<string, Set<string>>();

let ioInstance: Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
> | null = null;

export function getIO() {
  if (!ioInstance) {
    throw new Error(
      "Realtime server non initialisé. Appelle createRealtime() au boot de ton app.",
    );
  }
  return ioInstance;
}

interface CreateRealtimeOptions {
  corsOrigin: string | string[];
}

export function createRealtime({ corsOrigin }: CreateRealtimeOptions) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >({
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  const engine = new Engine({
    path: "/socket.io/",
  });

  io.bind(engine);

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
    } catch {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", (socket: AppSocket) => {
    const { user } = socket.data;

    socket.join(rooms.user(user.id));

    if (!onlineUsers.has(user.id)) onlineUsers.set(user.id, new Set());
    onlineUsers.get(user.id)!.add(socket.id);
    if (onlineUsers.get(user.id)!.size === 1) {
      io.emit("presence:update", { userId: user.id, status: "online" });
    }

    socket.on("room:join", (room, ack) => {
      socket.join(room);
      ack?.(true);
    });
    socket.on("room:leave", (room, ack) => {
      socket.leave(room);
      ack?.(true);
    });

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

  ioInstance = io;

  return { io, engine };
}

export function isUserOnline(userId: string) {
  return (onlineUsers.get(userId)?.size ?? 0) > 0;
}
