import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  BarChart2,
  ShieldAlert,
  ScrollText,
  Settings,
} from "lucide-react";

export const adminNavLinks = [
  { to: "/admin", label: "Vue d'ensemble", icon: LayoutDashboard },
  { to: "/admin/users", label: "Utilisateurs", icon: Users },
  { to: "/admin/workspace", label: "Espaces", icon: Building2 },
  { to: "/admin/billing", label: "Facturation", icon: CreditCard },
  { to: "/admin/analytics", label: "Analytique", icon: BarChart2 },
  { to: "/admin/moderation", label: "Modération", icon: ShieldAlert },
  { to: "/admin/monitoring", label: "Centre d'activité", icon: ScrollText },
  { to: "/admin/settings", label: "Paramètres", icon: Settings },
];
