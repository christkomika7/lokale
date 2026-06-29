import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { adminClient } from "better-auth/client/plugins";
import { env } from "./env";
import { Role } from "@lokale/types/user";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_HOST,
  plugins: [
    inferAdditionalFields({
      user: {
        firstname: { type: "string", required: true },
        lastname: { type: "string", required: true },
        role: {
          type: [Role.ADMIN, Role.USER, Role.WORKSPACE],
          required: true,
          defaultValue: Role.USER,
          input: false,
        },
      },
    }),
    emailOTPClient(),
    adminClient(),
  ],
});
