import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { env } from "./env";
import { UserRole } from "@lokale/types/user";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_HOST,
  plugins: [
    inferAdditionalFields({
      user: {
        firstname: { type: "string", required: true },
        lastname: { type: "string", required: true },
        role: {
          type: [UserRole.ADMIN, UserRole.USER, UserRole.WORKSPACE],
          required: true,
          defaultValue: UserRole.USER,
          input: false,
        },
      },
    }),
    emailOTPClient(),
    adminClient(),
  ],
});
