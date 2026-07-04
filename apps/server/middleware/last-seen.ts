import { Elysia } from "elysia";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { LAST_SEEN_THROTTLE_MS } from "@lokale/config/auth/user";
import { getClientIp, recordUserIp } from "../lib/ip";

const recentlySeenCache = new Map<string, number>();

export const lastSeenPlugin = new Elysia({ name: "last-seen" }).derive(
  { as: "global" },
  async ({ request, server }) => {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return {};
    }

    const userId = session.user.id;
    const ip = getClientIp(request.headers, server, request);

    const cacheKey = `${userId}:${ip}`;
    const now = Date.now();
    const lastCached = recentlySeenCache.get(cacheKey);

    if (!lastCached || now - lastCached > LAST_SEEN_THROTTLE_MS) {
      recentlySeenCache.set(cacheKey, now);

      prisma.user
        .update({
          where: { id: userId },
          data: { lastSeenAt: new Date() },
        })
        .catch((err) => console.error("[last-seen] update failed:", err));

      recordUserIp(userId, ip);
    }

    return { session };
  },
);
