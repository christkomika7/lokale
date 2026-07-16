import { hashToken } from "@lokale/lib/token";
import { prisma } from "../../lib/prisma";
import { decodeJWTExpiry } from "./jwt";
import type {
  VerificationTokenStatus,
  ResetPasswordTokenStatus,
} from "@lokale/types/verification";

export async function getVerificationTokenStatus(
  token: string,
): Promise<VerificationTokenStatus> {
  if (!token) return "invalid";

  const decoded = decodeJWTExpiry(token);
  console.log("decoded", decoded);
  if (!decoded) return "invalid";

  if (decoded.exp * 1000 < Date.now()) {
    return "expired";
  }

  const tokenHash = hashToken(token);
  const wasAttempted = await prisma.verificationTokenLog.findUnique({
    where: { tokenHash },
  });

  return wasAttempted ? "already-verified" : "pending";
}

export async function getResetPasswordTokenStatus(
  token: string,
): Promise<ResetPasswordTokenStatus> {
  if (!token) return "invalid";

  const identifier = `reset-password:${token}`;
  const verification = await prisma.verification.findFirst({
    where: { identifier },
  });

  const tokenHash = hashToken(token);
  const wasUsed = await prisma.verificationTokenLog.findUnique({
    where: { tokenHash },
  });

  if (!verification) {
    return wasUsed ? "already-used" : "invalid";
  }

  if (verification.expiresAt.getTime() < Date.now()) {
    return "expired";
  }

  return wasUsed ? "already-used" : "pending";
}
