import { Prisma } from "../generated/prisma/client";
import { serializeError } from "./helpers";
import { prisma } from "./prisma";
import {
  BaseLogInput,
  ErrorLogInput,
  WarningLogInput,
  LogLevel,
  LogStatus,
} from "@lokale/types/logger";

class ActivityLogger {
  async success(input: BaseLogInput) {
    return this.write({ ...input, status: "SUCCESS", level: "INFO" });
  }

  async warning(input: WarningLogInput) {
    return this.write({
      ...input,
      status: "WARNING",
      level: input.level ?? "WARNING",
    });
  }

  async error(input: ErrorLogInput) {
    return this.write({
      ...input,
      status: "ERROR",
      level: input.level ?? "ERROR",
      errorRaw: serializeError(input.error),
    });
  }

  async pending(input: BaseLogInput) {
    return this.write({ ...input, status: "PENDING", level: "INFO" });
  }

  private async write(
    input: BaseLogInput & {
      status: LogStatus;
      level: LogLevel;
      errorRaw?: Prisma.InputJsonValue;
    },
  ) {
    try {
      return await prisma.activityLog.create({
        data: {
          userId: input.actor?.id ?? null,
          userRole: input.actor?.role ?? null,
          userName: input.actor?.name ?? null,
          userEmail: input.actor?.email ?? null,
          action: input.action,
          status: input.status,
          level: input.level,
          message: input.message,
          errorRaw: input.errorRaw,
          targetType: input.targetType,
          targetId: input.targetId,
          metadata: input.metadata as Prisma.InputJsonValue,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
          durationMs: input.durationMs,
        },
      });
    } catch (err) {
      console.error("[ActivityLogger] Échec de l'écriture du log :", err);
      return null;
    }
  }

  /**
   * Wrapper pratique : exécute `fn`, chronomètre, et logue automatiquement
   * le succès ou l'échec (avec l'erreur capturée). Re-throw l'erreur pour
   * que ton code appelant garde le contrôle.
   *
   * @example
   * const payment = await activityLogger.track(
   *   { actor, action: LogAction.PAYMENT_CREATED, successMessage: "Paiement créé", targetType: "Payment" },
   *   () => createPayment(data)
   * );
   */
  async track<T>(
    input: Omit<BaseLogInput, "message"> & {
      successMessage: string;
      errorMessage?: string;
    },
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      await this.success({
        ...input,
        message: input.successMessage,
        durationMs: Date.now() - start,
      });
      return result;
    } catch (err) {
      await this.error({
        ...input,
        message: input.errorMessage ?? `Échec de l'action ${input.action}`,
        error: err,
        durationMs: Date.now() - start,
      });
      throw err;
    }
  }
}

export const activityLogger = new ActivityLogger();

// ---------------------------------------------------------------------
// Helpers de lecture, pratiques pour un dashboard admin
// ---------------------------------------------------------------------
export const ActivityLogQuery = {
  forUser(userId: string, opts?: { take?: number; skip?: number }) {
    return prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: opts?.take ?? 50,
      skip: opts?.skip,
    });
  },

  byStatus(status: LogStatus, opts?: { take?: number }) {
    return prisma.activityLog.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
      take: opts?.take ?? 50,
    });
  },

  critical(opts?: { take?: number }) {
    return prisma.activityLog.findMany({
      where: { level: "CRITICAL" },
      orderBy: { createdAt: "desc" },
      take: opts?.take ?? 50,
    });
  },

  forTarget(targetType: string, targetId: string) {
    return prisma.activityLog.findMany({
      where: { targetType, targetId },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Purge les logs antérieurs à `olderThan` — à brancher sur un cron pour la rétention. */
  purgeOlderThan(olderThan: Date) {
    return prisma.activityLog.deleteMany({
      where: { createdAt: { lt: olderThan } },
    });
  },
};
