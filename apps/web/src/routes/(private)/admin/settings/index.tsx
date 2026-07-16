import { createFileRoute } from "@tanstack/react-router";
import {
  Settings,
  Shield,
  Mail,
  HardDrive,
  Plug,
  MapPin,
  Tag,
} from "lucide-react";

import General from "#/components/dashboard/settings/general";
import GeoManager from "#/components/dashboard/settings/geomanager";
import CategoryManager from "#/components/dashboard/settings/categories";
import Security from "#/components/dashboard/settings/security";
import Emails from "#/components/dashboard/settings/email";
import Integrations from "#/components/dashboard/settings/integration";
import Storage from "#/components/dashboard/settings/storage";
import { Sidebar, type Tab } from "#/components/navigation/sidebar";
import type { TabKey } from "@lokale/types/navigation";

const TABS: Tab[] = [
  { key: "general", label: "Général", icon: Settings },
  { key: "geomanager", label: "Gestion géographique", icon: MapPin },
  { key: "categories", label: "Catégories", icon: Tag },
  { key: "security", label: "Sécurité", icon: Shield },
  { key: "emails", label: "Emails", icon: Mail },
  { key: "storage", label: "Stockage", icon: HardDrive },
  { key: "integrations", label: "Intégrations", icon: Plug },
];

export const Route = createFileRoute("/(private)/admin/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const content: Record<TabKey, React.ReactNode> = {
    general: <General />,
    geomanager: <GeoManager />,
    categories: <CategoryManager />,
    security: <Security />,
    emails: <Emails />,
    storage: <Storage />,
    integrations: <Integrations />,
  };
  return <Sidebar tabs={TABS} content={content} />;
}
