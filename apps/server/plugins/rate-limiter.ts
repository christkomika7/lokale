import { Elysia } from "elysia";
import { MAX_REQUESTS, WINDOW_MS } from "@lokale/config/auth/rate-limiter";
import { prisma } from "../lib/prisma";
import { getIP, getUserIdFromSession, applyBan } from "../lib/rate";

export const rateLimiter = new Elysia({ name: "rate-limiter" })
  .derive({ as: "global" }, ({ request, server }) => ({
    clientIP: getIP(request, server),
  }))
  .onBeforeHandle({ as: "global" }, async ({ clientIP, request, status }) => {
    const now = Date.now();
    const pathname = new URL(request.url).pathname;
    const key = `${clientIP}:${pathname}`;

    const ipRecord = await prisma.ip.findUnique({ where: { ip: clientIP } });

    if (ipRecord?.banned) {
      const isPermanent = !ipRecord.banExpires;
      const isExpired =
        ipRecord.banExpires && ipRecord.banExpires.getTime() < now;

      if (isPermanent || !isExpired) {
        const retryAfter = ipRecord.banExpires
          ? Math.ceil((ipRecord.banExpires.getTime() - now) / 1000)
          : null;

        return status(403, {
          code: "BANNED",
          message: isPermanent
            ? "Votre accès a été suspendu définitivement."
            : "Votre accès est temporairement suspendu.",
          reason: ipRecord.banReason,
          ...(retryAfter && { retryAfter }),
          ...(ipRecord.banExpires && {
            banExpires: ipRecord.banExpires.toISOString(),
          }),
        });
      }

      await prisma.ip.update({
        where: { ip: clientIP },
        data: { banned: false, banReason: null, banExpires: null },
      });
    }

    const existing = await prisma.rateLimit.findFirst({ where: { key } });

    if (existing) {
      const elapsed = now - Number(existing.lastRequest);

      if (elapsed > WINDOW_MS * 1000) {
        await prisma.rateLimit.update({
          where: { id: existing.id },
          data: { count: 1, lastRequest: BigInt(now) },
        });
        return;
      }

      if (existing.count >= MAX_REQUESTS) {
        const userId = await getUserIdFromSession(request);
        const { violations, banExpires, label } = await applyBan(
          clientIP,
          userId,
        );

        await prisma.rateLimit.update({
          where: { id: existing.id },
          data: { count: 0, lastRequest: BigInt(now) },
        });

        return status(429, {
          code: "RATE_LIMITED",
          message: `Trop de requêtes. Accès suspendu ${label}.`,
          violations,
          ...(banExpires && { banExpires: banExpires.toISOString() }),
          ...(banExpires && {
            retryAfter: Math.ceil((banExpires.getTime() - now) / 1000),
          }),
        });
      }

      await prisma.rateLimit.update({
        where: { id: existing.id },
        data: { count: { increment: 1 }, lastRequest: BigInt(now) },
      });
    } else {
      await prisma.rateLimit.create({
        data: {
          id: crypto.randomUUID(),
          key,
          count: 1,
          lastRequest: BigInt(now),
        },
      });
    }
  });
