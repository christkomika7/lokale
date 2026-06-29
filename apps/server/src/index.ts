import { Elysia } from "elysia";
import { envPlugin as env } from "../plugins/env";
import { betterAuthPlugin } from "../plugins/better-auth";
import { mailerPlugin } from "../plugins/mailer";
import { corsPlugin } from "../plugins/cors";
import { rateLimiter } from "../middleware/rate-limiter";
import { rateLimitStatus } from "../modules/security/rate-limite-status";
import { adminRoute } from "../modules/admin";

const app = new Elysia()
  .get("/", () => "Hello World")
  .use(env)
  .use(corsPlugin)
  .use(mailerPlugin)
  // .use(rateLimiter)
  // .use(rateLimitStatus)
  .use(betterAuthPlugin)

  // .use(wsPlugin)
  // .use(route)
  // .use(loggerPlugin)
  .use(adminRoute)
  .listen(env.decorator.env.PORT);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
