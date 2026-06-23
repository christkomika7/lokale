import Elysia from "elysia";
import { initMailer, verifyMailer } from "../lib/mailer";
import { envPlugin as env } from "../plugins/env";

export const mailerPlugin = new Elysia({ name: "mailer" }).onStart(async () => {
  initMailer({
    host: env.decorator.env.SMTP_HOST,
    port: env.decorator.env.SMTP_PORT,
    secure: env.decorator.env.SMTP_SECURE,
    auth: {
      user: env.decorator.env.SMTP_USER,
      pass: env.decorator.env.SMTP_PASS,
    },
    from: {
      address: env.decorator.env.SMTP_FROM_ADDRESS,
      name: env.decorator.env.SMTP_FROM_NAME,
    },
    // debug: env.decorator.env.APP_ENV === "development",
    debug: false,
  });

  const ok = await verifyMailer();
  console.info(
    ok ? "✅ [mailer] SMTP connecté" : "⚠️  [mailer] SMTP non joignable",
  );
});
