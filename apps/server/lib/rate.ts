import { formatBanDuration, getBanDuration } from "@lokale/lib/date";
import { auth } from "./auth";
import { prisma } from "./prisma";

export function getIP(request: Request, server: any): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-real-ip") ??
    server?.requestIP(request)?.address ??
    "unknown"
  );
}

export async function getUserIdFromSession(
  request: Request,
): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function applyBan(ip: string, userId: string | null) {
  const now = Date.now();
  const ipRecord = await prisma.ip.upsert({
    where: { ip },
    update: { violations: { increment: 1 } },
    create: {
      id: crypto.randomUUID(),
      ip,
      violations: 1,
    },
    select: { id: true, violations: true },
  });

  const violations = ipRecord.violations;
  const duration = getBanDuration(violations);
  const banExpires = duration ? new Date(now + duration) : null;
  const label = formatBanDuration(violations);

  await prisma.ip.update({
    where: { id: ipRecord.id },
    data: {
      banned: true,
      banReason: `Limite de requêtes dépassée (violation #${violations})`,
      banExpires,
    },
  });

  if (userId) {
    await prisma.userIp.upsert({
      where: { userId_ipId: { userId, ipId: ipRecord.id } },
      update: { lastSeen: new Date() },
      create: { userId, ipId: ipRecord.id },
    });
  }

  return { violations, banExpires, label };
}
