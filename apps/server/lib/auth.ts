import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { emailOtpPlugin } from "../plugins/auth/email-otp";
import { adminPlugin } from "../plugins/auth/admin";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { $Enums } from "../generated/prisma/browser";
import { signUpSchema } from "@lokale/lib/validator/auth";
import { MAX_REQUESTS, WINDOW_MS } from "@lokale/config/auth/rate-limiter";

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
      role: {
        type: [$Enums.Role.ADMIN, $Enums.Role.USER, $Enums.Role.WORKSPACE],
        required: true,
        input: false,
        defaultValue: $Enums.Role.USER,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
  },
  advanced: {
    cookiePrefix: "lokale",
    useSecureCookies: false, // true en production
    // domain: "localhost",
    // crossSubDomainCookies: {
    //   enabled: true,
    //   domain: "localhost",
    // },
    ipAddress: {
      ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
    },
  },
  trustedOrigins: ["http://localhost:3000"],
  // socialProviders: {
  //   facebook: {
  //     clientId: "",
  //     clientSecret: "",
  //   },
  //   google: {
  //     clientId: "",
  //     clientSecret: "",
  //   },
  // },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 jours
    updateAge: 60 * 60 * 24, // rafraîchit l'expiration si activité dans les dernières 24h
  },
  rateLimit: {
    enabled: true,
    window: WINDOW_MS,
    max: MAX_REQUESTS,
    storage: "database",
    modelName: "rateLimit",
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const data = signUpSchema.safeParse(ctx.body);

        if (!data.success) {
          throw new APIError("BAD_REQUEST", { message: "Email non autorisé" });
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
