export const rooms = {
  user: (userId: string) => `user:${userId}`,
  conversation: (conversationId: string) => `conversation:${conversationId}`,
  resource: (resource: string, id: string) => `resource:${resource}:${id}`,
  resourceList: (resource: string) => `resource:${resource}:list`,
  logsLive: () => "logs:live",
} as const;
