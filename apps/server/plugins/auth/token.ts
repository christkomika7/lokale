import { hashToken } from "@lokale/lib/token";
import { prisma } from "../../lib/prisma";
import { decodeJWTExpiry } from "./jwt";

type VerificationTokenStatus =
  | "pending"
  | "expired"
  | "already-verified"
  | "invalid";

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
