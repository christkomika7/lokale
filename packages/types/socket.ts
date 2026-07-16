export interface AuthedSocketUser {
  id: string;
  role: string;
  name?: string;
}

// ----- Events envoyés du serveur vers le client -----
export interface ServerToClientEvents {
  // Live sync générique : "une ressource en base vient de changer"
  "resource:updated": (payload: ResourceUpdatedPayload) => void;
  "resource:deleted": (payload: ResourceDeletedPayload) => void;
  "resource:created": (payload: ResourceCreatedPayload) => void;

  // Messagerie
  "message:new": (payload: MessagePayload) => void;
  "message:updated": (payload: MessagePayload) => void;
  "message:deleted": (payload: {
    conversationId: string;
    messageId: string;
  }) => void;
  "conversation:created": (payload: ConversationPayload) => void;
  "conversation:updated": (payload: ConversationPayload) => void;
  "typing:update": (payload: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  }) => void;

  // Notifications
  "notification:new": (payload: NotificationPayload) => void;
  "notification:read": (payload: { notificationId: string }) => void;

  // Logs d'activité (réservé aux admins abonnés à la room "logs:live")
  "log:new": (payload: ActivityLogPayload) => void;

  // Présence
  "presence:update": (payload: {
    userId: string;
    status: "online" | "offline";
  }) => void;
}

// ----- Events envoyés du client vers le serveur -----
export interface ClientToServerEvents {
  "room:join": (room: string, ack?: (ok: boolean) => void) => void;
  "room:leave": (room: string, ack?: (ok: boolean) => void) => void;

  "conversation:join": (conversationId: string) => void;
  "conversation:leave": (conversationId: string) => void;
  "typing:start": (conversationId: string) => void;
  "typing:stop": (conversationId: string) => void;

  "notification:mark-read": (
    notificationId: string,
    ack?: (ok: boolean) => void,
  ) => void;

  // Un admin demande à recevoir le flux de logs en direct. Le serveur
  // vérifie le rôle avant de faire rejoindre la room, l'ack renvoie false
  // si refusé (permet au client d'afficher "accès refusé" proprement).
  "logs:subscribe": (ack?: (ok: boolean) => void) => void;
  "logs:unsubscribe": () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

// Données attachées à chaque socket authentifié
export interface SocketData {
  user: AuthedSocketUser;
}

// ----- Payloads -----
export interface ResourceUpdatedPayload<T = unknown> {
  resource: string; // ex: "listing", "review", "user"
  id: string;
  data: T;
  updatedBy?: string;
}

export interface ResourceCreatedPayload<T = unknown> {
  resource: string;
  data: T;
}

export interface ResourceDeletedPayload {
  resource: string;
  id: string;
}

export interface MessagePayload {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  attachments?: string[];
}

export interface ConversationPayload {
  id: string;
  isGroup: boolean;
  name?: string;
  participantIds: string[];
  lastMessage?: MessagePayload;
}

export interface ActivityLogPayload {
  id: string;
  action: string;
  status: "SUCCESS" | "WARNING" | "FAILURE" | "PENDING" | "CANCELLED";
  level: "DEBUG" | "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  targetType?: string;
  targetId?: string;
  durationMs?: number;
  createdAt: string;
}

export interface NotificationPayload {
  id: string;
  userId: string;
  type: string;
  category?: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  actionUrl?: string;
  icon?: string;
  createdAt: string;
}
