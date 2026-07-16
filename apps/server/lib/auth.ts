import { betterAuth, type User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOtpPlugin } from "../plugins/auth/email-otp";
import { adminPlugin } from "../plugins/auth/admin";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { $Enums } from "../generated/prisma/browser";
import { signUpSchema } from "@lokale/lib/validator/auth";
import { MAX_REQUESTS, WINDOW_MS } from "@lokale/config/auth/rate-limiter";
import { sendEmail, sendResetPasswordEmail, sendVerifyEmail } from "./mailer";
import { envPlugin as env } from "../plugins/env";
import { hashToken } from "@lokale/lib/token";
import {
  RESET_PASSWORD_TOKEN_EXPIRES_IN,
  TOKEN_EXPIRES_IN,
} from "@lokale/config/auth/email";
import { minutesToSeconds } from "date-fns";
import { emailSchema } from "@lokale/lib/validator/user";
import { logActivity, logRejected, logSuccess } from "./logs";
import { createNotification } from "../realtime/lib/notifications";

// Chemins qui, une fois passés avec succès, signifient "l'email vient
// d'être vérifié" — que ce soit via le lien token classique ou via OTP.
const VERIFY_EMAIL_PATHS = ["/verify-email", "/email-otp/verify-email"];

function isRequestSuccessful(ctx: { context: { returned?: unknown } }) {
  const returned = ctx.context.returned as { error?: unknown } | undefined;
  return !returned?.error;
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  user: {
    additionalFields: {
      id: {
        type: "string",
        returned: true,
      },
      firstname: {
        type: "string",
        required: true,
      },
      lastname: {
        type: "string",
        required: true,
      },
      phone: { type: "string", required: false, fieldName: "phone" },
      city: { type: "string", required: false, fieldName: "city" },
      emailVerified: {
        type: "boolean",
        required: false,
        fieldName: "emailVerified",
      },
      role: {
        type: [$Enums.Role.ADMIN, $Enums.Role.USER, $Enums.Role.WORKSPACE],
        required: true,
        input: false,
        defaultValue: $Enums.Role.USER,
      },
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, token }, request) => {
      const url = `${env.decorator.env.CLIENT_URL}/verify-email?token=${token}`;
      await sendVerifyEmail(user.email, url, {
        userName: user.name,
        expiresInMinutes: TOKEN_EXPIRES_IN,
      });
    },
    sendOnSignUp: false,
    autoSignInAfterVerification: false,
    expiresIn: minutesToSeconds(TOKEN_EXPIRES_IN),
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    resetPasswordTokenExpiresIn: minutesToSeconds(
      RESET_PASSWORD_TOKEN_EXPIRES_IN,
    ),
    async sendResetPassword({ user, token }, request) {
      await prisma.verification.deleteMany({
        where: {
          value: user.id,
          identifier: { startsWith: "reset-password:" },
          NOT: { identifier: `reset-password:${token}` },
        },
      });

      const url = `${env.decorator.env.CLIENT_URL}/reset-password?token=${token}`;
      await sendResetPasswordEmail(user.email, url, {
        userName: user.name,
        expiresInMinutes: RESET_PASSWORD_TOKEN_EXPIRES_IN,
      });
    },
  },
  advanced: {
    cookiePrefix: "lokale",
    useSecureCookies: false, // true en production
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  trustedOrigins: ["http://localhost:3000"],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const data = signUpSchema.safeParse(ctx.body);

        if (!data.success) {
          await logRejected({
            action: "auth.sign_up_rejected",
            message: "Tentative d'inscription avec un email non autorisé",
            userEmail: ctx.body?.email,
            ipAddress: ctx.request?.headers.get("x-forwarded-for") ?? undefined,
            userAgent: ctx.request?.headers.get("user-agent") ?? undefined,
          });
          throw new APIError("BAD_REQUEST", { message: "Email non autorisé" });
        }
      }

      if (ctx.path === "/verify-email") {
        const token = ctx.query?.token;
        if (typeof token === "string" && token.length > 0) {
          const tokenHash = hashToken(token);
          await prisma.verificationTokenLog
            .upsert({
              where: { tokenHash },
              create: { tokenHash },
              update: {},
            })
            .catch(() => {});
        }
      }

      if (ctx.path === "/email-otp/send-verification-otp") {
        const data = emailSchema.safeParse(ctx.body);

        if (!data.success) {
          await logRejected({
            action: "auth.otp_send_rejected",
            message: "Demande d'OTP avec un email non autorisé",
            userEmail: ctx.body?.email,
          });
          throw new APIError("BAD_REQUEST", { message: "Email non autorisé" });
        }
      }

      if (ctx.path === "/reset-password") {
        const token = ctx.body?.token;
        if (typeof token === "string" && token.length > 0) {
          const tokenHash = hashToken(token);
          const alreadyUsed = await prisma.verificationTokenLog.findUnique({
            where: { tokenHash },
          });

          if (alreadyUsed) {
            await logRejected({
              action: "auth.reset_password_rejected",
              message:
                "Tentative de réutilisation d'un lien de reset déjà utilisé",
            });
            throw new APIError("BAD_REQUEST", {
              message: "Ce lien a déjà été utilisé.",
              code: "INVALID_TOKEN",
            });
          }
        }
      }

      // --- Actions admin sensibles (ban / rôle) ---
      if (ctx.path === "/admin/ban-user" || ctx.path === "/admin/unban-user") {
        // Le log lui-même se fait dans le hook `after`, une fois qu'on sait
        // si l'action a réussi. Rien à faire ici, ce bloc est là pour la
        // lisibilité et si tu veux ajouter une vérification avant coup.
      }
    }),
    after: createAuthMiddleware(async (ctx) => {
      const succeeded = isRequestSuccessful(ctx);

      if (ctx.path === "/reset-password") {
        const token = ctx.body?.token;

        if (succeeded && typeof token === "string" && token.length > 0) {
          const tokenHash = hashToken(token);
          await prisma.verificationTokenLog
            .upsert({
              where: { tokenHash },
              create: { tokenHash },
              update: {},
            })
            .catch(() => {});
        }

        await logActivity({
          action: "auth.reset_password",
          status: succeeded ? "SUCCESS" : "FAILURE",
          level: succeeded ? "INFO" : "WARNING",
          message: succeeded
            ? "Mot de passe réinitialisé avec succès"
            : "Échec de la réinitialisation du mot de passe",
        });
      }

      if (ctx.path === "/sign-in/email") {
        await logActivity({
          action: succeeded ? "auth.sign_in" : "auth.sign_in_failed",
          status: succeeded ? "SUCCESS" : "FAILURE",
          level: succeeded ? "INFO" : "WARNING",
          message: succeeded
            ? "Connexion réussie"
            : "Échec de connexion (identifiants invalides)",
          userEmail: ctx.body?.email,
          ipAddress: ctx.request?.headers.get("x-forwarded-for") ?? undefined,
          userAgent: ctx.request?.headers.get("user-agent") ?? undefined,
        });
      }

      // --- Email vérifié (token classique OU OTP) : notif + log ---
      if (VERIFY_EMAIL_PATHS.includes(ctx.path) && succeeded) {
        // Le champ exact dépend de la route : le endpoint token-based a
        // souvent l'email en query, l'endpoint OTP l'a dans le body.
        const email =
          (ctx.query?.email as string | undefined) ??
          (ctx.body?.email as string | undefined);

        if (email) {
          const user = await prisma.user.findUnique({ where: { email } });

          if (user) {
            await createNotification({
              userId: user.id,
              type: "SYSTEM",
              title: "Adresse email vérifiée",
              message:
                "Ton adresse email a été vérifiée avec succès. Ton compte est maintenant actif.",
              channel: "IN_APP",
              priority: "NORMAL",
            });

            await logSuccess({
              action: "auth.email_verified",
              message: `Email vérifié pour ${user.email}`,
              userId: user.id,
              userEmail: user.email,
              targetType: "user",
              targetId: user.id,
            });
          }
        }
      }

      // --- Actions admin sensibles ---
      if (ctx.path === "/admin/ban-user") {
        await logActivity({
          action: succeeded ? "user.banned" : "user.ban_failed",
          status: succeeded ? "SUCCESS" : "FAILURE",
          level: succeeded ? "WARNING" : "ERROR", // WARNING même en succès: c'est une action sensible à surveiller
          message: succeeded ? "Utilisateur banni" : "Échec du bannissement",
          targetType: "user",
          targetId: ctx.body?.userId,
        });
      }

      if (ctx.path === "/admin/unban-user") {
        await logActivity({
          action: succeeded ? "user.unbanned" : "user.unban_failed",
          status: succeeded ? "SUCCESS" : "FAILURE",
          level: "INFO",
          message: succeeded
            ? "Utilisateur débanni"
            : "Échec du débannissement",
          targetType: "user",
          targetId: ctx.body?.userId,
        });
      }

      if (ctx.path === "/admin/set-role") {
        await logActivity({
          action: succeeded ? "user.role_changed" : "user.role_change_failed",
          status: succeeded ? "SUCCESS" : "FAILURE",
          level: "WARNING",
          message: succeeded
            ? `Rôle modifié vers ${ctx.body?.role}`
            : "Échec du changement de rôle",
          targetType: "user",
          targetId: ctx.body?.userId,
        });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const role =
            user.role === "user"
              ? $Enums.Role.USER
              : user.role === "admin"
                ? $Enums.Role.ADMIN
                : $Enums.Role.WORKSPACE;
          return {
            data: {
              ...user,
              role,
            },
          };
        },
        // Déclenché juste après l'insertion en base : c'est ici, et pas
        // dans le hook `after` de /sign-up/email, qu'on est sûr que le
        // user existe réellement en DB (utile aussi si un admin crée un
        // user via /admin/create-user, qui passe par le même hook).
        after: async (user) => {
          await createNotification({
            userId: user.id,
            type: "SYSTEM", // adapte à la valeur exacte de ton enum NotificationType
            title: "Bienvenue sur Lokale",
            message: `Ton compte a été créé, ${user.firstname ?? user.name}. Vérifie ton email pour l'activer.`,
            channel: "IN_APP",
            priority: "NORMAL",
          });

          await logSuccess({
            action: "user.created",
            message: `Nouvel utilisateur créé: ${user.email}`,
            userId: user.id,
            userEmail: user.email,
            targetType: "user",
            targetId: user.id,
          });
        },
      },
    },
  },

  plugins: [emailOtpPlugin, adminPlugin],
});
