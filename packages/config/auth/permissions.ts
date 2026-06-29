import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

export const statement = {
  ...defaultStatements,
  user: ["create", "read", "update", "delete", "ban", "impersonate"] as const,
  platform: ["create", "read", "update", "delete", "publish"] as const,
  content: ["create", "read", "update", "delete", "publish"] as const,
  certification: ["create", "read", "update", "delete", "approve"] as const,
  storage: ["read", "delete"] as const,
  billing: ["read", "refund"] as const,
} as const;

export const ac = createAccessControl(statement);

export const userRole = ac.newRole({
  user: ["read"],
  platform: ["read"],
  content: ["read", "create"],
  certification: ["read"],
  storage: ["read"],
  billing: [],
});

export const workspaceRole = ac.newRole({
  user: ["read", "update"],
  platform: ["create", "read", "update", "publish"],
  content: ["create", "read", "update", "publish"],
  certification: ["create", "read", "update"],
  storage: ["read", "delete"],
  billing: ["read"],
});

export const adminRole = ac.newRole({
  ...adminAc.statements,
  user: ["create", "read", "update", "delete", "ban", "impersonate"],
  platform: ["create", "read", "update", "delete", "publish"],
  content: ["create", "read", "update", "delete", "publish"],
  certification: ["create", "read", "update", "delete", "approve"],
  storage: ["read", "delete"],
  billing: ["read", "refund"],
});
