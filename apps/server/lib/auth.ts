import { betterAuth, type User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOtpPlugin } from "../plugins/auth/email-otp";
import { adminPlugin } from "../plugins/auth/admin";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { $Enums } from "../generated/prisma/browser";
import { signUpSchema } from "@lokale/lib/validator/auth";
import { MAX_REQUESTS, WINDOW_MS } from "@lokale/config/auth/rate-limiter";
import { sendEmail, sendVerifyEmail } from "./mailer";
import { envPlugin as env } from "../plugins/env";
import { hashToken } from "@lokale/lib/token";
import { TOKEN_EXPIRES_IN } from "@lokale/config/auth/email";
import { addMinutes, minutesToSeconds } from "date-fns";

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
    sendVerificationEmail: async ({ user, token }) => {
      const url = `${env.decorator.env.CLIENT_URL}/verify-email?token=${token}`;
      console.log({ user, token });
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
  },
  // advanced: {
  //   cookiePrefix: "lokale",
  //   useSecureCookies: false, // true en production
  //   ipAddress: {
  //     ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
  //   },
  // },
  trustedOrigins: ["http://localhost:3000"],
  // session: {
  //   expiresIn: 60 * 60 * 24 * 30, // 30 jours
  //   updateAge: 60 * 60 * 24,
  // },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const data = signUpSchema.safeParse(ctx.body);

        if (!data.success) {
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
      },
    },
  },

  plugins: [emailOtpPlugin, adminPlugin],
});
