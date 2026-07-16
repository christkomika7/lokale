import { app } from "./app";
import { envPlugin as env } from "../plugins/env";
import { socketHandlers } from "../realtime/lib/io";

const { websocket, ...engineFetchHandlers } = socketHandlers;

Bun.serve({
  port: env.decorator.env.PORT,
  idleTimeout: 30, // doit être > pingInterval de socket.io (défaut 25s)
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/socket.io")) {
      return engineFetchHandlers.fetch(req, server);
    }
    return app.handle(req);
  },
  websocket,
});

console.log(
  `🦊 Elysia + socket.io en écoute sur le port ${env.decorator.env.PORT}`,
);
