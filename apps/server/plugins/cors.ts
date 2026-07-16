import { cors } from "@elysiajs/cors";
import { envPlugin as env } from "./env";

export const corsPlugin = cors({
  origin: env.decorator.env.CLIENT_URL!,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
