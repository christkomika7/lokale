import { admin } from "better-auth/plugins";

export const adminPlugin = admin({
  defaultRole: "user",
  adminRole: "admin",
  bannedUserMessage:
    "Votre compte a été suspendu suite à des activités suspectes. Contactez le support.",
  defaultBanExpiresIn: 60 * 60 * 24,
});
