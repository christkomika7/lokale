export enum SortKey {
  JOINED_AT = "joinedAt",
  NAME = "name",
  ACTIONS = "actions",
}

export const sort: Map<SortKey, string> = new Map([
  [SortKey.JOINED_AT, "Date inscription"],
  [SortKey.NAME, "Nom"],
  [SortKey.ACTIONS, "Activité"],
]);
