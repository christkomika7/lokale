import { Elysia } from "elysia";
import { prisma } from "../../lib/prisma";
import { SYSTEM_ID } from "../../config/system";
import { systemSchema } from "@lokale/lib/validator/admin";
import { auth } from "../../lib/auth";
import { logFailure, logFromRequest } from "../../lib/logs";

import type { System } from "../../generated/prisma/client";

export const systemRoutes = new Elysia({ prefix: "/system" })
  .derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return { user: session?.user ?? null };
  })

  .get("/", async () => {
    const system = await prisma.system.findUnique({
      where: { id: SYSTEM_ID },
    });

    if (system) return system;
    return prisma.system.create({
      data: { id: SYSTEM_ID },
    });
  })

  .patch(
    "/",
    async ({ body, set, request, user }) => {
      const start = performance.now();
      const before = await prisma.system.findUnique({
        where: { id: SYSTEM_ID },
      });

      try {
        const updated = await prisma.system.upsert({
          where: { id: SYSTEM_ID },
          update: body,
          create: { id: SYSTEM_ID, ...body },
        });

        const changes: Record<string, { from: unknown; to: unknown }> = {};
        for (const key of Object.keys(body) as (keyof typeof body)[]) {
          const prevValue = before?.[key as keyof System];
          const nextValue = updated[key as keyof System];
          if (prevValue !== nextValue) {
            changes[key] = { from: prevValue ?? null, to: nextValue };
          }
        }

        const maintenanceToggled = "maintenance" in changes;

        await logFromRequest(
          { request, user },
          {
            action: "system.updated",
            message: Object.keys(changes).length
              ? `Paramètres système modifiés: ${Object.keys(changes).join(", ")}`
              : "Paramètres système enregistrés (aucun changement détecté)",
            level: maintenanceToggled ? "WARNING" : "INFO",
            targetType: "system",
            targetId: SYSTEM_ID,
            metadata: { changes },
            durationMs: Math.round(performance.now() - start),
          },
        );

        set.status = 200;
        return { message: "Paramètres système mis à jour.", system: updated };
      } catch (error) {
        await logFailure({
          action: "system.update_failed",
          message: "Échec de la mise à jour des paramètres système",
          targetType: "system",
          targetId: SYSTEM_ID,
          userId: user?.id,
          userRole: user?.role,
          userName: user?.name,
          userEmail: user?.email,
          error,
          durationMs: Math.round(performance.now() - start),
        });
        throw error;
      }
    },
    { body: systemSchema },
  );
