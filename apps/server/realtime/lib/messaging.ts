import { prisma } from "../../lib/prisma";
import { getIO } from "./io";
import { rooms } from "./rooms";
import type { ConversationPayload, MessagePayload } from "@lokale/types/socket";

function toMessagePayload(m: {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  createdAt: Date;
}): MessagePayload {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    content: m.content,
    attachments: m.attachments,
    createdAt: m.createdAt.toISOString(),
  };
}

/** Récupère ou crée une conversation 1-à-1 entre deux users (idempotent). */
export async function getOrCreateDirectConversation(
  userAId: string,
  userBId: string,
) {
  const existing = await prisma.conversation.findFirst({
    where: {
      isGroup: false,
      AND: [
        { participants: { some: { userId: userAId } } },
        { participants: { some: { userId: userBId } } },
      ],
    },
    include: { participants: true },
  });

  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      isGroup: false,
      participants: {
        create: [{ userId: userAId }, { userId: userBId }],
      },
    },
    include: { participants: true },
  });
}

/** Crée un groupe de discussion avec une liste de membres. */
export async function createGroupConversation(params: {
  name: string;
  creatorId: string;
  memberIds: string[];
}) {
  const { name, creatorId, memberIds } = params;
  const uniqueMembers = Array.from(new Set([creatorId, ...memberIds]));

  const conversation = await prisma.conversation.create({
    data: {
      isGroup: true,
      name,
      participants: {
        create: uniqueMembers.map((userId) => ({
          userId,
          isAdmin: userId === creatorId,
        })),
      },
    },
    include: { participants: true },
  });

  const payload: ConversationPayload = {
    id: conversation.id,
    isGroup: true,
    name: conversation.name ?? undefined,
    participantIds: uniqueMembers,
  };

  const io = getIO();
  for (const userId of uniqueMembers) {
    io.to(rooms.user(userId)).emit("conversation:created", payload);
  }

  return conversation;
}

/** Envoie un message dans une conversation (DM ou groupe) et notifie en temps réel. */
export async function sendMessage(params: {
  conversationId: string;
  senderId: string;
  content: string;
  attachments?: string[];
}) {
  const { conversationId, senderId, content, attachments = [] } = params;

  // Vérifie que l'auteur fait bien partie de la conversation
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!participant)
    throw new Error("FORBIDDEN: not a conversation participant");

  const message = await prisma.message.create({
    data: { conversationId, senderId, content, attachments },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const payload = toMessagePayload(message);
  const io = getIO();

  // Tous les participants connectés à la room de la conversation la reçoivent
  // instantanément (ceux qui ont ouvert le chat).
  io.to(rooms.conversation(conversationId)).emit("message:new", payload);

  // On notifie aussi la room perso de chaque participant (utile pour mettre
  // à jour un badge "messages non lus" même si le chat n'est pas ouvert).
  const participants = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: senderId } },
    select: { userId: true },
  });
  for (const { userId } of participants) {
    io.to(rooms.user(userId)).emit("message:new", payload);
  }

  return message;
}

export async function markConversationRead(
  conversationId: string,
  userId: string,
) {
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });
}

export async function listConversationMessages(
  conversationId: string,
  cursor?: string,
) {
  return prisma.message.findMany({
    where: { conversationId, deletedAt: null },
    orderBy: { createdAt: "desc" },
    take: 30,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });
}
