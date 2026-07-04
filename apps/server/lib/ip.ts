import { prisma } from "./prisma";
import type { Server } from "bun";

export function getClientIp(
  headers: Headers,
  server?: Server<WebSocket> | null,
  request?: Request,
): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  if (server && request) {
    const socketAddress = server.requestIP(request);
    if (socketAddress?.address) {
      return socketAddress.address;
    }
  }

  return "unknown";
}
export async function recordUserIp(userId: string, ip: string) {
  if (!ip || ip === "unknown") return;

  try {
    const ipRecord = await prisma.ip.upsert({
      where: { ip },
      update: {},
      create: { ip },
    });

    await prisma.userIp.upsert({
      where: {
        userId_ipId: { userId, ipId: ipRecord.id },
      },
      update: {},
      create: { userId, ipId: ipRecord.id },
    });
  } catch (err) {
    console.error("[record-user-ip] failed:", err);
  }
}
