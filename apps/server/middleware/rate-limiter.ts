import { Elysia } from "elysia";
import { MAX_REQUESTS, WINDOW_MS } from "@lokale/config/auth/rate-limiter";
import { prisma } from "../lib/prisma";
import { getIP, getUserIdFromSession, applyBan } from "../lib/rate";

const rateLimitCache = new Map<
  string,
  { count: number; lastRequest: number }
>();
const bannedIpCache = new Map<
  string,
  { banExpires: number | null; banReason: string | null }
>();

setInterval(
  () => {
    const now = Date.now();
    for (const [key, val] of rateLimitCache) {
      if (now - val.lastRequest > WINDOW_MS * 1000) rateLimitCache.delete(key);
    }
    for (const [ip, val] of bannedIpCache) {
      if (val.banExpires && val.banExpires < now) bannedIpCache.delete(ip);
    }
  },
  5 * 60 * 1000,
);

export const rateLimiter = new Elysia({ name: "rate-limiter" })
  .derive({ as: "global" }, ({ request, server }) => ({
    clientIP: getIP(request, server),
  }))
  .onBeforeHandle({ as: "global" }, async ({ clientIP, request, status }) => {
    const now = Date.now();
    const pathname = new URL(request.url).pathname;
    const key = `${clientIP}:${pathname}`;

    let banned = bannedIpCache.get(clientIP);

    if (!banned) {
      const ipRecord = await prisma.ip.findUnique({ where: { ip: clientIP } });
      if (ipRecord?.banned) {
        banned = {
          banExpires: ipRecord.banExpires?.getTime() ?? null,
          banReason: ipRecord.banReason,
        };
        bannedIpCache.set(clientIP, banned);
      }
    }

    if (banned) {
      const isPermanent = !banned.banExpires;
      const isExpired = banned.banExpires && banned.banExpires < now;

      if (isPermanent || !isExpired) {
        const retryAfter = banned.banExpires
          ? Math.ceil((banned.banExpires - now) / 1000)
          : null;

        return status(403, {
          code: "BANNED",
          message: isPermanent
            ? "Votre accès a été suspendu définitivement."
            : "Votre accès est temporairement suspendu.",
          reason: banned.banReason,
          ...(retryAfter && { retryAfter }),
          ...(banned.banExpires && {
            banExpires: new Date(banned.banExpires).toISOString(),
          }),
        });
      }

      bannedIpCache.delete(clientIP);
      await prisma.ip.update({
        where: { ip: clientIP },
        data: { banned: false, banReason: null, banExpires: null },
      });
    }

    const cached = rateLimitCache.get(key);
    const elapsed = cached ? now - cached.lastRequest : Infinity;

    if (!cached || elapsed > WINDOW_MS * 1000) {
      rateLimitCache.set(key, { count: 1, lastRequest: now });
      prisma.rateLimit
        .upsert({
          where: { key },
          update: { count: 1, lastRequest: BigInt(now) },
          create: {
            id: crypto.randomUUID(),
            key,
            count: 1,
            lastRequest: BigInt(now),
          },
        })
        .catch(console.error);
      return;
    }

    if (cached.count >= MAX_REQUESTS) {
      const userId = await getUserIdFromSession(request);
      const { violations, banExpires, label } = await applyBan(
        clientIP,
        userId,
      );

      bannedIpCache.set(clientIP, {
        banExpires: banExpires?.getTime() ?? null,
        banReason: null,
      });
      rateLimitCache.delete(key);

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
    cached.count += 1;
    cached.lastRequest = now;
    rateLimitCache.set(key, cached);
  });
