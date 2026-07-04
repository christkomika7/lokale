import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { Plan, Role } from "../../types/user";

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

export const roles = [
  { id: 1, value: Role.USER, label: "Utilisateur" },
  { id: 2, value: Role.WORKSPACE, label: "Entreprise" },
  { id: 3, value: Role.ADMIN, label: "Admin" },
];

export const plans = [
  [
    { id: 1, value: Plan.FREE, label: "Gratuit" },
    {
      id: 2,
      value: Plan.STARTER,
      label: "Starter",
    },
    { id: 3, value: Plan.PRO, label: "Pro" },
    {
      id: 4,
      value: Plan.BUSINESS,
      label: "Business",
    },
  ],
];

export function getPlans(options: Plan[]) {
  return plans.flat().filter((plan) => options.includes(plan.value));
}
