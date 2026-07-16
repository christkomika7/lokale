export const SORT_FIELD_MAP: Record<string, "name" | "joinedAt" | "activity"> =
  {
    name: "name",
    joinedAt: "joinedAt",
    lastSeen: "activity",
  } as const;

export const SORTABLE_FIELDS = {
  name: "name",
  joinedAt: "createdAt",
  activity: "lastSeenAt",
} as const;
