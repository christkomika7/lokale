import type { Plan, Role, UserStatus } from "@lokale/types/user";

export const statusCfg: Record<
  UserStatus,
  { label: string; dot: string; badge: string }
> = {
  ACTIVE: {
    label: "Actif",
    dot: "bg-emerald-400!",
    badge:
      "bg-emerald-50! text-emerald-600! dark:bg-emerald-500/10! dark:text-emerald-400!",
  },
  SUSPENDED: {
    label: "Suspendu",
    dot: "bg-amber-400",
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
  BANNED: {
    label: "Banni",
    dot: "bg-red-500",
    badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  PENDING: {
    label: "En attente",
    dot: "bg-zinc-400",
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400",
  },
};

export const roleCfg: Record<Role, { label: string; badge: string }> = {
  USER: {
    label: "Utilisateur",
    badge: "bg-zinc-100 text-zinc-600 dark:bg-zinc-700/50 dark:text-zinc-400",
  },
  WORKSPACE: {
    label: "Entreprise",
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
  ADMIN: {
    label: "Admin",
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
};

export const planCfg: Record<Plan, { label: string; badge: string }> = {
  FREE: {
    label: "Free",
    badge: "bg-zinc-100 text-zinc-500 dark:bg-zinc-700/50 dark:text-zinc-400",
  },
  STARTER: {
    label: "Starter",
    badge:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  PRO: {
    label: "Pro",
    badge:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  },
  BUSINESS: {
    label: "Business",
    badge: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  },
};
