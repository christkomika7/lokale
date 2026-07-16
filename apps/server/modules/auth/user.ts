import { Elysia, t } from "elysia";
import { auth } from "../../lib/auth";
import { emailSchema } from "@lokale/lib/validator/user";
import {
  getResetPasswordTokenStatus,
  getVerificationTokenStatus,
} from "../../plugins/auth/token";
import { envPlugin as env } from "../../plugins/env";
import { logSuccess, logRejected, logFailure } from "../../lib/logs";

export const userAuthRoute = new Elysia({ prefix: "/user" })
  .get(
    "/verification-token-status",
    async ({ query }) => {
      try {
        const status = await getVerificationTokenStatus(query.token ?? "");

        if (status === "invalid") {
          await logRejected({
            action: "auth.verification_token_check_rejected",
            message: `Statut du token de vérification: ${status}`,
          });
        }

        return { status };
      } catch (err) {
        await logFailure({
          action: "auth.verification_token_check_failed",
          message: "Échec technique lors de la vérification du statut du token",
          error: err,
        });
        throw err;
      }
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

        await logSuccess({
          action: "auth.verification_email_resent",
          message: `Email de vérification renvoyé à ${email}`,
          userEmail: email,
        });
      } catch (err) {
        // On n'expose jamais l'échec au client (énumération d'emails), mais
        // on le log quand même pour le monitoring.
        await logFailure({
          action: "auth.verification_email_resend_failed",
          message: `Échec du renvoi de l'email de vérification pour ${email}`,
          userEmail: email,
          error: err,
        });
      }

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
      try {
        const status = await getResetPasswordTokenStatus(query.token ?? "");

        if (status === "invalid") {
          await logRejected({
            action: "auth.reset_password_token_check_rejected",
            message: `Statut du token de reset password: ${status}`,
          });
        }

        return { status };
      } catch (err) {
        await logFailure({
          action: "auth.reset_password_token_check_failed",
          message: "Échec technique lors de la vérification du token de reset",
          error: err,
        });
        throw err;
      }
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

        await logSuccess({
          action: "auth.reset_password_resent",
          message: `Lien de réinitialisation renvoyé à ${email}`,
          userEmail: email,
        });
      } catch (err) {
        await logFailure({
          action: "auth.reset_password_resend_failed",
          message: `Échec du renvoi du lien de reset password pour ${email}`,
          userEmail: email,
          error: err,
        });
      }

      return {
        message:
          "Si un compte existe avec cette adresse, un nouveau lien vient d'être envoyé.",
      };
    },
    { body: emailSchema },
  );
