import { useApiMutation } from "#/hook/use-api-mutation";
import { usePaginatedQuery } from "#/hook/use-paginated-query";
import type {
  Plan,
  PlanSchemaType,
  Role,
  RoleSchemaType,
  User,
  UserEditSchemaType,
  UserSchemaType,
  UserStatus,
} from "@lokale/types/user";

import type { SortableKey } from "@lokale/types/filter";

interface MessageResponse {
  message: string;
}

interface SuspendPayload {
  reason?: string;
  durationDays?: number;
}

interface BanPayload {
  reason?: string;
}

export const api = {
  getUser: (
    debouncedSearch: string,
    statusFilter: "all" | UserStatus,
    roleFilter: "all" | Role,
    planFilter: "all" | Plan,
    sortOrder: string,
    sortBy?: SortableKey,
  ) =>
    usePaginatedQuery<User>(["users"], "/admin/users", {
      pageSize: 20,
      params: {
        search: debouncedSearch || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
        plan: planFilter !== "all" ? planFilter : undefined,
        sortBy,
        sortOrder,
      },
    }),
  createUser: () =>
    useApiMutation<User, UserSchemaType>("/admin/users", {
      method: "post",
      invalidate: ["users"],
      successMessage: "L'utilisateur a été créé avec succès",
    }),

  updateUser: (userId: string) =>
    useApiMutation<User, UserEditSchemaType>(() => `/admin/users/${userId}`, {
      method: "patch",
      invalidate: ["users"],
      successMessage: "Utilisateur mis à jour",
    }),

  changePlan: (userId: string) =>
    useApiMutation<Plan, PlanSchemaType>(() => `/admin/users/plan/${userId}`, {
      method: "patch",
      invalidate: ["users"],
      successMessage: "Le plan mis à jour",
    }),

  changeRole: (userId: string) =>
    useApiMutation<Role, RoleSchemaType>(() => `/admin/users/role/${userId}`, {
      method: "patch",
      invalidate: ["users"],
      successMessage: "Le rôle a été mis à jour",
    }),

  cancelPlan: (userId: string) =>
    useApiMutation<void, void>(() => `/admin/users/plan/cancel/${userId}`, {
      method: "patch",
      invalidate: ["users"],
      successMessage: "Le plan a été annulé avec succès",
    }),

  changePassword: (userId: string) =>
    useApiMutation<MessageResponse, void>(
      () => `/admin/users/send-reset-password/${userId}`,
      {
        method: "post",
        successMessage: "Le lien de réinitialisation a été envoyé",
      },
    ),

  suspend: (userId: string) =>
    useApiMutation<MessageResponse, SuspendPayload>(
      () => `/admin/users/suspend/${userId}`,
      {
        method: "post",
        invalidate: ["users"],
        successMessage: "L'utilisateur a été suspendu",
      },
    ),
  reactivate: (userId: string) =>
    useApiMutation<MessageResponse, void>(
      () => `/admin/users/reactivate/${userId}`,
      {
        method: "post",
        invalidate: ["users"],
        successMessage: "L'utilisateur a été réactivé",
      },
    ),
  ban: (userId: string) =>
    useApiMutation<MessageResponse, BanPayload>(
      () => `/admin/users/ban/${userId}`,
      {
        method: "post",
        invalidate: ["users"],
        successMessage: "L'utilisateur a été banni",
      },
    ),

  unban: (userId: string) =>
    useApiMutation<MessageResponse, void>(
      () => `/admin/users/unban/${userId}`,
      {
        method: "post",
        invalidate: ["users"],
        successMessage: "L'utilisateur a été réactivé",
      },
    ),

  deleteUser: (userId: string) =>
    useApiMutation<MessageResponse, void>(() => `/admin/users/${userId}`, {
      method: "delete",
      invalidate: ["users"],
      successMessage: "Le compte a été supprimé",
    }),
};
