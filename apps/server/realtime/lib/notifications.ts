import {
  NotificationChannel,
  NotificationPriority,
  NotificationType,
  Prisma,
} from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { getIO } from "./io";
import { rooms } from "./rooms";
import type { NotificationPayload } from "@lokale/types/socket";

function toPayload(n: {
  id: string;
  userId: string;
  type: NotificationType;
  category: string | null;
  title: string;
  message: string;
  data: unknown;
  isRead: boolean;
  actionUrl: string | null;
  icon: string | null;
  createdAt: Date;
}): NotificationPayload {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    category: n.category ?? undefined,
    title: n.title,
    message: n.message,
    data: (n.data as Record<string, unknown>) ?? undefined,
    isRead: n.isRead,
    actionUrl: n.actionUrl ?? undefined,
    icon: n.icon ?? undefined,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function createNotification(params: {
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
}) {
  const notification = await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      category: params.category,
      data: params.data as Prisma.InputJsonValue | undefined,
      channel: params.channel,
      priority: params.priority,
      actionUrl: params.actionUrl,
      icon: params.icon,
      expiresAt: params.expiresAt,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  getIO()
    .to(rooms.user(params.userId))
    .emit("notification:new", toPayload(notification));

  return notification;
}

/** Notifie plusieurs users d'un coup (ex: tous les abonnés d'une ville). */
export async function notifyUsers(
  userIds: string[],
  data: Omit<Parameters<typeof createNotification>[0], "userId">,
) {
  return Promise.all(
    userIds.map((userId) => createNotification({ userId, ...data })),
  );
}

export async function markNotificationRead(
  notificationId: string,
  userId: string,
) {
  const notification = await prisma.notification.findUniqueOrThrow({
    where: { id: notificationId },
  });

  if (notification.userId !== userId) throw new Error("FORBIDDEN");

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true, readAt: new Date() },
  });

  getIO().to(rooms.user(userId)).emit("notification:read", { notificationId });
  return updated;
}

export async function listNotifications(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { isRead: false } : {}) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
