Je dois bloquer toutes les request relative a l ip quand j ai le rate limit active
trim les texts et tout pour eviter les injections sql et les attaques xss
si une addresse ip depasse un certains nombre faut lui bloquer
Bloquer tout les access a cet addresse ip

# Cas aucun user

- si aucun user donnecter automatiquement, toujours verifier si le user existe son role et les permissions
- Quand je cree un compte il est fait avec le role workspace au lieu de user
- revoir les messages du au status code au niveau du rate de auth-error.ts
- Voir to les mailto present dans les liens de mon projet
- Creer un cron pour les users suspendu
- prevoir changer email dans user detail

```
Exemple complet : création d'un user → notification temps réel
Dans ta route de création d'user (par exemple dans userAuthRoute ou adminRoute selon où tu crées les users) :
typescript// modules/admin/user.controller.ts (exemple)
import { createNotification } from "@lokale/realtime-server";

export async function createUser(input: CreateUserInput) {
  const user = await prisma.user.create({ data: input });

  // Notifie l'utilisateur nouvellement créé (utile si un admin crée un
  // compte pour quelqu'un d'autre, ex: invitation à un workspace)
  await createNotification({
    userId: user.id,
    type: "SYSTEM", // adapte à une valeur existante de ton enum NotificationType
    title: "Bienvenue sur Lokale",
    message: `Ton compte a été créé avec succès, ${user.firstname}.`,
    channel: "IN_APP",
    priority: "NORMAL",
  });

  return user;
}
Côté client, dès que ce user est connecté (même sur un autre onglet), il reçoit l'event notification:new en direct :
typescript// dans un composant ou un hook
const { socket } = useRealtime();

useEffect(() => {
  const onNotification = (payload: NotificationPayload) => {
    toast(payload.title, { description: payload.message });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };
  socket.on("notification:new", onNotification);
  return () => void socket.off("notification:new", onNotification);
}, [socket]);
Dis-moi si tu veux que je te fasse aussi le hook useNotifications complet (liste + badge non-lu + mark-as-read optimiste avec TanStack Query) et le useConversation pour la messagerie — je peux les écrire avec la même précision une fois que tu m'auras confirmé les valeurs exactes de tes enums NotificationType/NotificationChannel/NotificationPriority.
```

```
Voici l'exemple complet, avec ton cas concret : liste d'utilisateurs dans l'admin, mise à jour instantanée chez tous les admins connectés.
1. Côté serveur — la route qui crée le user
typescript// modules/admin/user.controller.ts
import { publishResourceCreated } from "@lokale/realtime-server";
import { prisma } from "../../lib/prisma";

export async function createUser(input: CreateUserInput) {
  const user = await prisma.user.create({ data: input });

  // Prévient tous les clients qui "écoutent" la liste des users
  publishResourceCreated("user", user);

  return user;
}
publishResourceCreated (déjà dans ton publish.ts) émet vers la room resource:user:list — donc tout client qui a rejoint cette room reçoit l'event, peu importe la route Elysia où c'est déclenché.
2. Côté client — hook générique pour n'importe quelle liste
typescript// packages/realtime-client/src/hooks/use-live-resource-list.ts
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "../provider";
import type {
  ResourceCreatedPayload,
  ResourceUpdatedPayload,
  ResourceDeletedPayload,
} from "@lokale/types/socket";

interface UseLiveResourceListOptions<T> {
  /** Le type de ressource tel que publié côté serveur, ex: "user" */
  resource: string;
  /** La queryKey TanStack Query de ta liste, ex: ["users"] */
  queryKey: readonly unknown[];
  /** Comment identifier un item unique dans le tableau (ex: item.id) */
  getId: (item: T) => string;
}

/**
 * Abonne le composant à une room "resource:{type}:list" et garde la
 * queryKey TanStack Query correspondante synchronisée en direct :
 * - création  -> ajoute l'item en tête de liste
 * - update    -> remplace l'item modifié
 * - suppression -> retire l'item
 *
 * Aucun refetch réseau : la mise à jour est appliquée directement dans
 * le cache, donc c'est instantané pour l'utilisateur.
 */
export function useLiveResourceList<T>({
  resource,
  queryKey,
  getId,
}: UseLiveResourceListOptions<T>) {
  const { socket } = useRealtime();
  const queryClient = useQueryClient();

  useEffect(() => {
    const room = `resource:${resource}:list`;
    socket.emit("room:join", room);

    const onCreated = (payload: ResourceCreatedPayload<T>) => {
      if (payload.resource !== resource) return;
      queryClient.setQueryData<T[]>(queryKey, (old = []) => [payload.data, ...old]);
    };

    const onUpdated = (payload: ResourceUpdatedPayload<T>) => {
      if (payload.resource !== resource) return;
      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.map((item) => (getId(item) === payload.id ? payload.data : item)),
      );
    };

    const onDeleted = (payload: ResourceDeletedPayload) => {
      if (payload.resource !== resource) return;
      queryClient.setQueryData<T[]>(queryKey, (old = []) =>
        old.filter((item) => getId(item) !== payload.id),
      );
    };

    socket.on("resource:created", onCreated);
    socket.on("resource:updated", onUpdated);
    socket.on("resource:deleted", onDeleted);

    return () => {
      socket.emit("room:leave", room);
      socket.off("resource:created", onCreated);
      socket.off("resource:updated", onUpdated);
      socket.off("resource:deleted", onDeleted);
    };
  }, [socket, resource, queryClient, JSON.stringify(queryKey)]);
}
3. Utilisation dans ta page admin des users
tsx// routes/admin/users.tsx (ou équivalent chez toi)
import { useQuery } from "@tanstack/react-query";
import { useLiveResourceList } from "@lokale/realtime-client";
import type { User } from "@lokale/types/user";
import { api } from "./lib/api";

export default function AdminUsersPage() {
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.listUsers(),
  });

  // C'est cette ligne qui active le temps réel sur cette liste précise
  useLiveResourceList<User>({
    resource: "user",
    queryKey: ["users"],
    getId: (user) => user.id,
  });

  return (
    <div>
      {users.map((user) => (
        <div key={user.id}>{user.firstname} {user.lastname}</div>
      ))}
    </div>
  );
}
Ce qui se passe concrètement

PC A (admin ouvre /admin/users) → le hook fait socket.emit("room:join", "resource:user:list").
PC B (un autre admin) crée un user via ton UserForm en mode create.
Côté serveur, createUser() insère en base puis appelle publishResourceCreated("user", user) → émission vers la room resource:user:list.
PC A, toujours dans cette room, reçoit resource:created → queryClient.setQueryData(["users"], ...) insère le nouvel user dans le cache → React re-render automatiquement la liste, sans refetch, sans F5.

Même mécanique si tu modifies (update → publishResourceUpdate) ou supprimes (publishResourceDeleted) un user ailleurs dans ton code — appelle juste la bonne fonction juste après l'écriture Prisma, et n'importe quelle liste ouverte ailleurs se met à jour toute seule.
Un point à vérifier : assure-toi que updateUser/deleteUser côté admin appellent bien publishResourceUpdate("user", id, updatedUser) / publishResourceDeleted("user", id) juste après leur prisma.user.update/delete — c'est le seul endroit où tu dois penser à brancher le realtime, tout le reste (rooms, cache, re-render) est déjà géré par le hook.
```
