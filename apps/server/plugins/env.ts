import { t } from "elysia";
import { env } from "@yolk-oss/elysia-env";
import { envError } from "../config/message/env-error";

export const envPlugin = env({
  APP_ENV: t.String({
    error: envError.appEnv,
  }),
  CLIENT_URL: t.String({
    error: envError.clientUrl,
  }),
  BETTER_AUTH_SECRET: t.String({
    error: envError.betterAuthSecret,
  }),
  BETTER_AUTH_URL: t.String({
    error: envError.betterAuthUrl,
  }),
  DATABASE_URL: t.String({
    error: envError.databaseUrl,
  }),
  PORT: t.Integer({
    error: envError.port,
  }),
  SMTP_HOST: t.String({
    error: envError.smtpHost,
  }),
  SMTP_PORT: t.Integer({
    error: envError.smtpPort,
  }),
  SMTP_SECURE: t.Boolean({
    error: envError.smtpSecure,
  }),
  SMTP_USER: t.String({
    error: envError.smtpUser,
  }),
  SMTP_PASS: t.String({
    error: envError.smtpPass,
  }),
  SMTP_FROM_ADDRESS: t.String({
    error: envError.smtpFromAddress,
  }),
  SMTP_FROM_NAME: t.String({
    error: envError.smtpFromName,
  }),
});
