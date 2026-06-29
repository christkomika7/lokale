import { admin } from "better-auth/plugins";
import {
  ac,
  adminRole,
  userRole,
  workspaceRole,
} from "@lokale/config/auth/permissions";

export const adminPlugin = admin({
  ac,
  roles: {
    USER: userRole,
    WORKSPACE: workspaceRole,
    ADMIN: adminRole,
  },
  defaultRole: "USER",
  adminRoles: ["ADMIN"],
  bannedUserMessage:
    "Votre compte a été suspendu suite à des activités suspectes. Contactez le support.",
  defaultBanExpiresIn: 60 * 60 * 24,
});
