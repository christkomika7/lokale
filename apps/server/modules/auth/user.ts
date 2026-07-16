import { Elysia, t } from "elysia";
import { auth } from "../../lib/auth";
import { emailSchema } from "@lokale/lib/validator/user";
import {
  getResetPasswordTokenStatus,
  getVerificationTokenStatus,
} from "../../plugins/auth/token";
import { envPlugin as env } from "../../plugins/env";

export const userAuthRoute = new Elysia({ prefix: "/user" })
  .get(
    "/verification-token-status",
    async ({ query }) => {
      console.log("token", query.token);
      console.log("TEST");
      const status = await getVerificationTokenStatus(query.token ?? "");
      console.log({ status });
      return { status };
    },
    {
      query: t.Object({
        token: t.String(),
      }),
    },
  )
  .post(
    "/resend-verification-email",
    async ({ body }) => {
      const email = body.email.trim();
      try {
        await auth.api.sendVerificationEmail({
          body: { email, callbackURL: "/verify-email" },
          headers: new Headers(),
        });
      } catch {}

      return {
        message:
          "Si un compte existe avec cette adresse, un email vient d'être envoyé.",
      };
    },
    {
      body: emailSchema,
    },
  )
  .get(
    "/reset-password-token-status",
    async ({ query }) => {
      const status = await getResetPasswordTokenStatus(query.token ?? "");
      return { status };
    },
    { query: t.Object({ token: t.String() }) },
  )
  .post(
    "/resend-reset-password",
    async ({ body }) => {
      const email = body.email.trim();
      try {
        await auth.api.requestPasswordReset({
          body: {
            email,
            redirectTo: `${env.decorator.env.CLIENT_URL}/reset-password`,
          },
          headers: new Headers(),
        });
      } catch {}

      return {
        message:
          "Si un compte existe avec cette adresse, un nouveau lien vient d'être envoyé.",
      };
    },
    { body: emailSchema },
  );
