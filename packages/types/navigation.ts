import type { LucideIcon } from "lucide-react";

export type TabKey =
  | "general"
  | "security"
  | "emails"
  | "storage"
  | "integrations"
  | "geomanager"
  | "categories";

export type NavLink = {
  to: string;
  label: string;
  icon: LucideIcon;
  variant?: "success" | "danger";
  notification?: number;
};
