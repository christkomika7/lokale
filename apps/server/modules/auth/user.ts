import { Elysia, t } from "elysia";
import { auth } from "../../lib/auth";
import { emailSchema } from "@lokale/lib/validator/user";
import { getVerificationTokenStatus } from "../../plugins/auth/token";

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
  );
