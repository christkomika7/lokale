// C'est LE fichier que tu importes dans tes routes Elysia (users, listings,
// reviews, peu importe) pour dire "cette ressource vient de changer,
// prévenez tout le monde qui regarde".

import { getIO } from "./io";
import { rooms } from "./rooms";
import type { NotificationPayload } from "@lokale/types/socket";

/**
 * Publie une mise à jour de ressource à tous les clients qui:
 * - suivent cette ressource précise (resource:{type}:{id})
 * - suivent la liste de ce type de ressource (resource:{type}:list)
 *
 * Exemple dans une route Elysia après un update Prisma:
 *   const listing = await prisma.listing.update({ where: { id }, data });
 *   publishResourceUpdate("listing", listing.id, listing);
 */
export function publishResourceUpdate<T>(
  resource: string,
  id: string,
  data: T,
  updatedBy?: string,
) {
  const io = getIO();
  io.to(rooms.resource(resource, id)).emit("resource:updated", {
    resource,
    id,
    data,
    updatedBy,
  });
  io.to(rooms.resourceList(resource)).emit("resource:updated", {
    resource,
    id,
    data,
    updatedBy,
  });
}

export function publishResourceCreated<T>(resource: string, data: T) {
  const io = getIO();
  io.to(rooms.resourceList(resource)).emit("resource:created", {
    resource,
    data,
  });
}

export function publishResourceDeleted(resource: string, id: string) {
  const io = getIO();
  io.to(rooms.resource(resource, id)).emit("resource:deleted", {
    resource,
    id,
  });
  io.to(rooms.resourceList(resource)).emit("resource:deleted", {
    resource,
    id,
  });
}

/** Envoie une notification à un user précis (toutes ses connexions/onglets). */
export function publishToUser(userId: string, payload: NotificationPayload) {
  getIO().to(rooms.user(userId)).emit("notification:new", payload);
}
