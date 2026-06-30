import {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
  Prisma,
} from "../generated/prisma/client";
import { prisma } from "./prisma";
import {
  NotificationPayload,
  NotificationChannelAdapter,
} from "@lokale/types/notification";

class EmailAdapter implements NotificationChannelAdapter {
  async send(payload: NotificationPayload) {
    // TODO: brancher Resend / Nodemailer / SendGrid...
    console.log(`[Email] -> ${payload.to} : ${payload.title}`);
  }
}

class SmsAdapter implements NotificationChannelAdapter {
  async send(payload: NotificationPayload) {
    // TODO: brancher Twilio / Vonage...
    console.log(`[SMS] -> ${payload.to} : ${payload.message}`);
  }
}

class PushAdapter implements NotificationChannelAdapter {
  async send(payload: NotificationPayload) {
    // TODO: brancher Firebase Cloud Messaging / OneSignal...
    console.log(`[Push] -> ${payload.to} : ${payload.title}`);
  }
}

const adapters: Record<"EMAIL" | "SMS" | "PUSH", NotificationChannelAdapter> = {
  EMAIL: new EmailAdapter(),
  SMS: new SmsAdapter(),
  PUSH: new PushAdapter(),
};

// ---------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------
interface CreateNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  category?: string;
  data?: Record<string, unknown>;
  channel?: NotificationChannel;
  priority?: NotificationPriority;
  actionUrl?: string;
  icon?: string;
  expiresAt?: Date;
}

// ---------------------------------------------------------------------
// Service principal
// ---------------------------------------------------------------------
class NotificationService {
  /**
   * Crée une notification. Si un canal externe (EMAIL/SMS/PUSH) est précisé,
   * la notification est aussi dispatchée vers ce canal (en respectant les
   * préférences de l'utilisateur).
   */
  async create(input: CreateNotificationInput) {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId: input.userId },
    });

    const channel = input.channel ?? "IN_APP";

    const isMuted =
      (prefs?.mutedTypes?.includes(input.type) ?? false) ||
      (input.category
        ? (prefs?.mutedCategories?.includes(input.category) ?? false)
        : false);

    // Si le type/catégorie est mute par l'utilisateur, on ne crée même pas la notif in-app
    if (isMuted) {
      return null;
    }

    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        category: input.category,
        data: input.data as Prisma.InputJsonValue,
        channel,
        priority: input.priority ?? "NORMAL",
        actionUrl: input.actionUrl,
        icon: input.icon,
        expiresAt: input.expiresAt,
        status: channel === "IN_APP" ? "DELIVERED" : "PENDING",
      },
    });

    if (channel !== "IN_APP") {
      await this.dispatch(notification.id, channel, prefs);
    }

    return notification;
  }

  /** Envoie une notification déjà créée vers son canal externe. */
  private async dispatch(
    notificationId: string,
    channel: NotificationChannel,
    prefs: {
      emailEnabled: boolean;
      smsEnabled: boolean;
      pushEnabled: boolean;
    } | null,
  ) {
    if (channel === "IN_APP") return;

    const notif = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: { user: true },
    });
    if (!notif) return;

    const channelEnabled: Record<"EMAIL" | "SMS" | "PUSH", boolean> = {
      EMAIL: prefs?.emailEnabled ?? true,
      SMS: prefs?.smsEnabled ?? false,
      PUSH: prefs?.pushEnabled ?? true,
    };

    if (!channelEnabled[channel as "EMAIL" | "SMS" | "PUSH"]) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: "FAILED",
          failReason: "Canal désactivé par l'utilisateur",
          failedAt: new Date(),
        },
      });
      return;
    }

    try {
      // Adapte la résolution du destinataire à ton implémentation
      // (ex: table à part pour les device tokens push)
      const to =
        channel === "EMAIL"
          ? notif.user.email
          : channel === "SMS"
            ? (notif.user.phone ?? "")
            : notif.userId;

      if (!to) throw new Error(`Pas de destinataire pour le canal ${channel}`);

      await adapters[channel as "EMAIL" | "SMS" | "PUSH"].send({
        to,
        title: notif.title,
        message: notif.message,
        data: notif.data as Record<string, unknown>,
      });

      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: "SENT", sentAt: new Date() },
      });
    } catch (err) {
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: "FAILED",
          failReason: err instanceof Error ? err.message : String(err),
          failedAt: new Date(),
        },
      });
    }
  }

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true, readAt: new Date(), status: "READ" },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date(), status: "READ" },
    });
  }

  async unreadCount(userId: string) {
    return prisma.notification.count({ where: { userId, isRead: false } });
  }

  async list(
    userId: string,
    opts?: { take?: number; skip?: number; onlyUnread?: boolean },
  ) {
    return prisma.notification.findMany({
      where: { userId, ...(opts?.onlyUnread ? { isRead: false } : {}) },
      orderBy: { createdAt: "desc" },
      take: opts?.take ?? 30,
      skip: opts?.skip,
    });
  }

  async delete(notificationId: string) {
    return prisma.notification.delete({ where: { id: notificationId } });
  }

  /** À brancher sur un cron pour nettoyer les notifs expirées (promos, etc.) */
  async deleteExpired() {
    return prisma.notification.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
  }
}

export const notificationService = new NotificationService();

// ---------------------------------------------------------------------
// Préférences utilisateur
// ---------------------------------------------------------------------
export const NotificationPreferences = {
  get(userId: string) {
    return prisma.notificationPreference.findUnique({ where: { userId } });
  },

  /** Crée les préférences par défaut — à appeler à la création d'un user. */
  createDefault(userId: string) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  },

  update(
    userId: string,
    data: Partial<{
      emailEnabled: boolean;
      smsEnabled: boolean;
      pushEnabled: boolean;
      inAppEnabled: boolean;
      mutedTypes: NotificationType[];
      mutedCategories: string[];
    }>,
  ) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  },
};
