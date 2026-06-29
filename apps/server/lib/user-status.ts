import { Prisma } from "../generated/prisma/client";
import { UserStatus } from "@lokale/types/user";

interface BanFields {
  banned: boolean;
  banExpires: Date | null;
  emailVerified: boolean;
}

export function computeUserStatus({
  banned,
  banExpires,
  emailVerified,
}: BanFields): UserStatus {
  const isCurrentlyBanned =
    banned && (banExpires === null || banExpires > new Date());

  if (isCurrentlyBanned) {
    return banExpires === null ? UserStatus.BANNED : UserStatus.SUSPENDED;
  }

  return emailVerified ? UserStatus.ACTIVE : UserStatus.PENDING;
}

export function buildStatusWhere(status: UserStatus): Prisma.UserWhereInput {
  const now = new Date();

  switch (status) {
    case UserStatus.BANNED:
      // banni à vie : banned=true et pas de date d'expiration
      return { banned: true, banExpires: null };

    case UserStatus.SUSPENDED:
      // banni temporairement : banned=true avec une expiration future
      return { banned: true, banExpires: { gt: now } };

    case UserStatus.PENDING:
      // pas banni (ou ban expiré) + email non vérifié
      return {
        emailVerified: false,
        OR: [{ banned: false }, { banned: true, banExpires: { lte: now } }],
      };

    case UserStatus.ACTIVE:
      // pas banni (ou ban expiré) + email vérifié
      return {
        emailVerified: true,
        OR: [{ banned: false }, { banned: true, banExpires: { lte: now } }],
      };

    default:
      return {};
  }
}
