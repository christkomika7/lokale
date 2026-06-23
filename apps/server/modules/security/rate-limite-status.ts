import { Elysia } from "elysia";

export const rateLimitStatus = new Elysia({ name: "rate-limit-status" }).get(
  "/rate-limit/status",
  () => ({ banned: false }),
);
