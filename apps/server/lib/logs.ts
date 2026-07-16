// Usage minimal:
//   await logActivity({
//     action: "user.created",
//     status: "SUCCESS",
//     message: "Nouvel utilisateur créé",
//     userId: user.id,
//     targetType: "user",
//     targetId: user.id,
//   });

import { prisma } from "../lib/prisma";
import { LogLevel, LogStatus, Role } from "../generated/prisma/client";
import { getIO } from "../realtime/lib/io";
import { rooms } from "../realtime/lib/rooms";
import type { ActivityLogPayload } from "@lokale/types/socket";

export interface LogActivityInput {
  action: string;
  message: string;
  status?: LogStatus; // default: "SUCCESS"
  level?: LogLevel; // default: "INFO"

  userId?: string;
  userRole?: Role;
  userName?: string;
  userEmail?: string;

  targetType?: string;
  targetId?: string;

  metadata?: Record<string, unknown>;
  error?: unknown; // passe l'erreur brute, elle sera sérialisée dans errorRaw

  ipAddress?: string;
  userAgent?: string;
  durationMs?: number;
}

function serializeError(error: unknown) {
  if (!error) return undefined;
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: error.cause ? String(error.cause) : undefined,
    };
  }
  // erreur non standard (string, objet plain, etc.)
  try {
    return JSON.parse(JSON.stringify(error));
  } catch {
    return { raw: String(error) };
  }
}

/**
 * Insère une entrée dans activity_log. Ne throw jamais : le logging ne doit
 * jamais faire planter le flow métier qui l'appelle. En cas d'échec
 * d'écriture, on log juste en console.
 */
export async function logActivity(input: LogActivityInput) {
  try {
    const log = await prisma.activityLog.create({
      data: {
        action: input.action,
        message: input.message,
        status: input.status ?? "SUCCESS",
        level: input.level ?? "INFO",

        userId: input.userId,
        userRole: input.userRole,
        userName: input.userName,
        userEmail: input.userEmail,

        targetType: input.targetType,
        targetId: input.targetId,

        metadata: input.metadata as never, // voir note Prisma Json plus bas
        errorRaw: serializeError(input.error) as never,

        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        durationMs: input.durationMs,
      },
    });

    // Diffusion en direct vers les admins abonnés au dashboard de logs.
    // On avale toute erreur ici (io pas encore prêt au boot, etc.) pour ne
    // jamais faire échouer l'écriture du log à cause du realtime.
    try {
      const payload: ActivityLogPayload = {
        id: log.id,
        action: log.action,
        status: log.status,
        level: log.level,
        message: log.message,
        userId: log.userId ?? undefined,
        userName: log.userName ?? undefined,
        userEmail: log.userEmail ?? undefined,
        targetType: log.targetType ?? undefined,
        targetId: log.targetId ?? undefined,
        durationMs: log.durationMs ?? undefined,
        createdAt: log.createdAt.toISOString(),
      };
      getIO().to(rooms.logsLive()).emit("log:new", payload);
    } catch (err) {
      console.error("[activity-log] échec de la diffusion realtime:", err);
    }

    return log;
  } catch (err) {
    console.error("[activity-log] échec de l'écriture en base:", err);
    return null;
  }
}

// ---------------------------------------------------------------------
// Helpers pour les cas les plus fréquents, pour éviter de répéter
// status/level à chaque appel.
// ---------------------------------------------------------------------

export function logSuccess(input: Omit<LogActivityInput, "status" | "level">) {
  return logActivity({ ...input, status: "SUCCESS", level: "INFO" });
}

/** Action refusée/rejetée mais attendue dans le flow normal (validation, permission...). */
export function logRejected(input: Omit<LogActivityInput, "status" | "level">) {
  return logActivity({ ...input, status: "FAILURE", level: "WARNING" });
}

/** Échec technique (exception, timeout, service externe down...). */
export function logFailure(
  input: Omit<LogActivityInput, "status" | "level"> & { error?: unknown },
) {
  return logActivity({ ...input, status: "FAILURE", level: "ERROR" });
}

/** Panne grave impactant plusieurs users ou un service critique. */
export function logCritical(
  input: Omit<LogActivityInput, "status" | "level"> & { error?: unknown },
) {
  return logActivity({ ...input, status: "FAILURE", level: "CRITICAL" });
}

export function logPending(input: Omit<LogActivityInput, "status" | "level">) {
  return logActivity({ ...input, status: "PENDING", level: "INFO" });
}

// ---------------------------------------------------------------------
// Helper pour extraire automatiquement ip/userAgent/user depuis une
// requête Elysia, histoire de ne pas répéter ça à chaque appel.
// ---------------------------------------------------------------------

interface RequestLikeContext {
  request: Request;
  user?: { id: string; role?: Role; name?: string; email?: string } | null;
}

export function logFromRequest(
  ctx: RequestLikeContext,
  input: Omit<
    LogActivityInput,
    "userId" | "userRole" | "userName" | "userEmail" | "ipAddress" | "userAgent"
  >,
) {
  const headers = ctx.request.headers;
  const ipAddress =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    undefined;

  return logActivity({
    ...input,
    userId: ctx.user?.id,
    userRole: ctx.user?.role,
    userName: ctx.user?.name,
    userEmail: ctx.user?.email,
    ipAddress,
    userAgent: headers.get("user-agent") ?? undefined,
  });
}

// ---------------------------------------------------------------------
// Helper pour chronométrer une action et logger sa durée automatiquement,
// succès ou échec.
// ---------------------------------------------------------------------

export async function withActivityLog<T>(
  input: Omit<LogActivityInput, "durationMs" | "status" | "level">,
  fn: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    await logSuccess({
      ...input,
      durationMs: Math.round(performance.now() - start),
    });
    return result;
  } catch (error) {
    await logFailure({
      ...input,
      error,
      durationMs: Math.round(performance.now() - start),
    });
    throw error; // on relance : le logging ne doit pas avaler l'erreur métier
  }
}

// ---------------------------------------------------------------------
// Convention pour le champ `action` (String libre en base) : format
// "resource.verbe", en anglais, en minuscules. Exemples :
//   "user.created", "user.updated", "user.deleted", "user.banned"
//   "auth.login", "auth.login_failed", "auth.logout", "auth.password_reset"
//   "order.paid", "order.refunded", "order.cancelled"
//   "notification.sent", "notification.failed"
// Garder cette convention stricte permet de filtrer/agréger facilement les
// logs par ressource ou par action dans un futur dashboard admin.
