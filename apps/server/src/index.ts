import { app } from "./app";
import { envPlugin as env } from "../plugins/env";
import { createRealtime } from "../realtime/lib/io";

const PORT = env.decorator.env.PORT;

const { engine } = createRealtime({
  corsOrigin: env.decorator.env.CLIENT_URL,
});

const { websocket, ...engineHandlers } = engine.handler();

Bun.serve({
  port: PORT,
  idleTimeout: 30,
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname.startsWith("/socket.io")) {
      return engineHandlers.fetch(req, server);
    }
    return app.handle(req);
  },
  websocket,
});

console.log(`🦊 Elysia + socket.io en écoute sur le port ${PORT}`);
