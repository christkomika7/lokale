import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Flag,
  ShieldAlert,
  ScrollText,
  Search,
  SlidersHorizontal,
  Download,
  X,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Ban,
  Trash2,
  Bell,
  UserX,
  MessageSquare,
  Image,
  FileText,
  Megaphone,
  RefreshCw,
  AlertCircle,
  Layers,
  LogIn,
  Settings,
  Shield,
  Server,
  Plus,
  Send,
  Archive,
  Clock,
  Edit2,
  Globe,
  Users,
  Building2,
  Pin,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Switch } from "#/components/ui/switch";
import Input from "#/components/input/input";
import { Separator } from "#/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";

export const Route = createFileRoute("/(private)/admin/monitoring/")({
  component: ModerationPage,
});

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportStatus = "pending" | "resolved" | "ignored";
type ReportReason = "spam" | "inappropriate" | "fake" | "harassment" | "other";
type ContentType =
  | "comment"
  | "image"
  | "announcement"
  | "publication"
  | "video";
type SanctionType = "warning" | "suspension" | "ban" | "deletion";
type LogLevel = "info" | "warning" | "error" | "critical";
type LogCategory =
  | "auth"
  | "admin"
  | "permission"
  | "deletion"
  | "server"
  | "modification";
type SuspiciousType =
  | "brute_force"
  | "unusual_api"
  | "mass_action"
  | "geo_anomaly";
type NotifType = "system" | "moderation" | "payment" | "user" | "security";
type AnnouncementStatus = "published" | "draft" | "archived" | "scheduled";
type AnnouncementTarget = "all" | "users" | "businesses" | "admins";

type Report = {
  id: string;
  reporter: string;
  reporterAvatar: string;
  reported: string;
  contentType: ContentType;
  contentPreview: string;
  reason: ReportReason;
  status: ReportStatus;
  date: string;
  workspace: string;
  proofs: number;
};
type Sanction = {
  id: string;
  user: string;
  type: SanctionType;
  reason: string;
  admin: string;
  date: string;
  active: boolean;
};
type SystemLog = {
  id: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  actor: string;
  target: string;
  ip: string;
  date: string;
};
type SuspiciousActivity = {
  id: string;
  type: SuspiciousType;
  source: string;
  user?: string;
  count: number;
  date: string;
  resolved: boolean;
};

type Notification = {
  id: string;
  type: NotifType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  priority: "low" | "medium" | "high";
  actionUrl?: string;
};

type Announcement = {
  id: string;
  title: string;
  content: string;
  status: AnnouncementStatus;
  target: AnnouncementTarget;
  author: string;
  createdAt: string;
  publishedAt?: string;
  scheduledAt?: string;
  pinned: boolean;
  views: number;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const REPORTS: Report[] = [
  {
    id: "r1",
    reporter: "Princesse Moukala",
    reporterAvatar: "",
    reported: "Arlette Massamba",
    contentType: "comment",
    contentPreview: "Ce service est une arnaque totale, évitez !",
    reason: "harassment",
    status: "pending",
    date: "2025-01-10 14:32",
    workspace: "Pharmacie Centrale",
    proofs: 2,
  },
  {
    id: "r2",
    reporter: "Jean-Baptiste N.",
    reporterAvatar: "",
    reported: "Utilisateur #8821",
    contentType: "announcement",
    contentPreview: "Gagnez 500 000 FCFA en 24h, cliquez ici !!!",
    reason: "spam",
    status: "pending",
    date: "2025-01-10 13:18",
    workspace: "Supermarché Géant",
    proofs: 0,
  },
  {
    id: "r3",
    reporter: "Rodrigue Bokamba",
    reporterAvatar: "",
    reported: "Boulangerie Moderne",
    contentType: "image",
    contentPreview: "Image trompeuse — fausse promotion affichée",
    reason: "fake",
    status: "resolved",
    date: "2025-01-09 18:05",
    workspace: "Boulangerie Moderne",
    proofs: 3,
  },
  {
    id: "r4",
    reporter: "Christelle Loemba",
    reporterAvatar: "",
    reported: "Utilisateur #4421",
    contentType: "comment",
    contentPreview: "Commentaire à caractère offensant et discriminatoire",
    reason: "inappropriate",
    status: "pending",
    date: "2025-01-09 11:20",
    workspace: "Restaurant Le Saveur",
    proofs: 1,
  },
  {
    id: "r5",
    reporter: "Serge Itoua",
    reporterAvatar: "",
    reported: "Utilisateur #3318",
    contentType: "publication",
    contentPreview: "Offre emploi frauduleuse avec demande d'argent",
    reason: "spam",
    status: "ignored",
    date: "2025-01-08 09:15",
    workspace: "TotalEnergies Congo",
    proofs: 0,
  },
  {
    id: "r6",
    reporter: "Mireille Nganga",
    reporterAvatar: "",
    reported: "Patrick Elenga",
    contentType: "video",
    contentPreview: "Vidéo promotionnelle avec fausses allégations",
    reason: "fake",
    status: "pending",
    date: "2025-01-07 16:44",
    workspace: "Hôtel Azur Palace",
    proofs: 4,
  },
];

const SANCTIONS: Sanction[] = [
  {
    id: "s1",
    user: "Arlette Massamba",
    type: "suspension",
    reason: "Harcèlement répété malgré avertissement",
    admin: "Super Admin",
    date: "2025-01-09 18:30",
    active: true,
  },
  {
    id: "s2",
    user: "Christelle Loemba",
    type: "ban",
    reason: "Spam massif et création de faux comptes",
    admin: "Super Admin",
    date: "2025-01-08 12:00",
    active: true,
  },
  {
    id: "s3",
    user: "Utilisateur #8821",
    type: "warning",
    reason: "Contenu trompeur — première infraction",
    admin: "Modérateur #1",
    date: "2025-01-07 10:15",
    active: false,
  },
  {
    id: "s4",
    user: "Patrick Elenga",
    type: "deletion",
    reason: "Vidéo frauduleuse supprimée du compte",
    admin: "Modérateur #2",
    date: "2025-01-06 14:22",
    active: false,
  },
  {
    id: "s5",
    user: "Utilisateur #3318",
    type: "warning",
    reason: "Publication offre emploi non conforme",
    admin: "Super Admin",
    date: "2025-01-05 09:40",
    active: true,
  },
];

const SYSTEM_LOGS: SystemLog[] = [
  {
    id: "l1",
    level: "critical",
    category: "admin",
    message: "Clé API production régénérée",
    actor: "Super Admin",
    target: "API Key — Production",
    ip: "197.243.12.4",
    date: "2025-01-10 16:30",
  },
  {
    id: "l2",
    level: "warning",
    category: "auth",
    message: "10 tentatives de connexion échouées",
    actor: "Inconnu",
    target: "admin@awa.cg",
    ip: "102.244.51.8",
    date: "2025-01-10 15:44",
  },
  {
    id: "l3",
    level: "info",
    category: "admin",
    message: "Utilisateur suspendu",
    actor: "Super Admin",
    target: "Arlette Massamba (#u3)",
    ip: "197.243.12.4",
    date: "2025-01-10 14:32",
  },
  {
    id: "l4",
    level: "info",
    category: "modification",
    message: "Paramètres SMTP mis à jour",
    actor: "Super Admin",
    target: "Serveur mail production",
    ip: "197.243.12.4",
    date: "2025-01-09 18:44",
  },
  {
    id: "l5",
    level: "error",
    category: "server",
    message: "Timeout base de données — 3 requêtes abandonnées",
    actor: "Système",
    target: "DB Production",
    ip: "—",
    date: "2025-01-09 14:12",
  },
  {
    id: "l6",
    level: "info",
    category: "deletion",
    message: "Contenu supprimé par modérateur",
    actor: "Modérateur #1",
    target: "Commentaire #c5 — spam",
    ip: "41.202.200.1",
    date: "2025-01-09 10:22",
  },
  {
    id: "l7",
    level: "warning",
    category: "permission",
    message: "Tentative accès route non autorisée",
    actor: "Utilisateur #44",
    target: "/admin/settings",
    ip: "41.202.219.14",
    date: "2025-01-08 22:10",
  },
  {
    id: "l8",
    level: "info",
    category: "auth",
    message: "Connexion admin réussie",
    actor: "Super Admin",
    target: "Session #s1",
    ip: "197.243.12.4",
    date: "2025-01-08 08:05",
  },
  {
    id: "l9",
    level: "critical",
    category: "server",
    message: "Erreur 500 — endpoint /api/payments",
    actor: "Système",
    target: "POST /api/payments/webhook",
    ip: "—",
    date: "2025-01-07 19:33",
  },
  {
    id: "l10",
    level: "info",
    category: "admin",
    message: "Mode maintenance activé",
    actor: "Super Admin",
    target: "Plateforme entière",
    ip: "197.243.12.4",
    date: "2025-01-07 22:00",
  },
];

const SUSPICIOUS: SuspiciousActivity[] = [
  {
    id: "sp1",
    type: "brute_force",
    source: "102.244.51.8",
    user: "admin@awa.cg",
    count: 14,
    date: "Il y a 2h",
    resolved: false,
  },
  {
    id: "sp2",
    type: "unusual_api",
    source: "41.202.100.8",
    user: undefined,
    count: 3,
    date: "Il y a 5h",
    resolved: false,
  },
  {
    id: "sp3",
    type: "mass_action",
    source: "197.243.80.1",
    user: "Utilisateur #8821",
    count: 8,
    date: "Il y a 1j",
    resolved: true,
  },
  {
    id: "sp4",
    type: "geo_anomaly",
    source: "185.220.101.5",
    user: "Rodrigue Bokamba",
    count: 1,
    date: "Il y a 2j",
    resolved: true,
  },
];

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    type: "security",
    title: "Tentative de connexion suspecte",
    message: "14 tentatives depuis 102.244.51.8 sur admin@awa.cg",
    date: "Il y a 2h",
    read: false,
    priority: "high",
    actionUrl: "/admin/moderation",
  },
  {
    id: "n2",
    type: "moderation",
    title: "4 signalements en attente",
    message: "Des contenus signalés nécessitent votre attention",
    date: "Il y a 3h",
    read: false,
    priority: "high",
    actionUrl: "/admin/moderation",
  },
  {
    id: "n3",
    type: "payment",
    title: "Transaction échouée",
    message: "TXN-9838 — Supermarché Géant — 25 000 FCFA",
    date: "Il y a 5h",
    read: false,
    priority: "medium",
  },
  {
    id: "n4",
    type: "system",
    title: "Erreur serveur critique",
    message: "Timeout sur POST /api/payments/webhook — 3 requêtes perdues",
    date: "Il y a 6h",
    read: true,
    priority: "high",
  },
  {
    id: "n5",
    type: "user",
    title: "Nouveau signalement reçu",
    message: "Mireille Nganga a signalé une vidéo sur Hôtel Azur Palace",
    date: "Il y a 8h",
    read: true,
    priority: "medium",
  },
  {
    id: "n6",
    type: "moderation",
    title: "Workspace en attente de validation",
    message: "Hôtel Azur Palace attend votre validation depuis 2 jours",
    date: "Il y a 1j",
    read: true,
    priority: "medium",
  },
  {
    id: "n7",
    type: "system",
    title: "Sauvegarde automatique réussie",
    message: "Backup quotidien effectué — 34.2 Go archivés",
    date: "Il y a 1j",
    read: true,
    priority: "low",
  },
  {
    id: "n8",
    type: "payment",
    title: "Remboursement en attente de traitement",
    message: "TXN-9821 — Pharmacie Centrale — 25 000 FCFA — en attente admin",
    date: "Il y a 2j",
    read: true,
    priority: "medium",
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "a1",
    title: "Mise à jour plateforme v2.4",
    content:
      "Nous déployons une mise à jour majeure incluant de nouvelles fonctionnalités pour les entreprises, une refonte de la carte interactive et des améliorations de performance.",
    status: "published",
    target: "all",
    author: "Super Admin",
    createdAt: "2025-01-08",
    publishedAt: "2025-01-08",
    pinned: true,
    views: 1240,
  },
  {
    id: "a2",
    title: "Maintenance planifiée — 23h00",
    content:
      "La plateforme sera momentanément inaccessible ce soir de 23h00 à 00h30 pour maintenance technique. Merci de votre compréhension.",
    status: "scheduled",
    target: "all",
    author: "Super Admin",
    createdAt: "2025-01-10",
    scheduledAt: "2025-01-10 23:00",
    pinned: false,
    views: 0,
  },
  {
    id: "a3",
    title: "Nouvelles offres Pro & Business pour les entreprises",
    content:
      "Découvrez nos nouveaux plans tarifaires avec plus d'avantages : boosts d'annonces, statistiques avancées, support prioritaire.",
    status: "published",
    target: "businesses",
    author: "Modérateur #1",
    createdAt: "2025-01-05",
    publishedAt: "2025-01-06",
    pinned: false,
    views: 892,
  },
  {
    id: "a4",
    title: "Brouillon — Campagne de fidélité",
    content:
      "Contenu en cours de rédaction pour la campagne de fidélité du trimestre...",
    status: "draft",
    target: "users",
    author: "Super Admin",
    createdAt: "2025-01-10",
    pinned: false,
    views: 0,
  },
  {
    id: "a5",
    title: "Bilan 2024 — Merci à tous !",
    content:
      "Une année exceptionnelle avec +14 000 utilisateurs, 2 341 entreprises et 12 villes couvertes.",
    status: "archived",
    target: "all",
    author: "Super Admin",
    createdAt: "2024-12-31",
    publishedAt: "2024-12-31",
    pinned: false,
    views: 3410,
  },
];

// ─── Config maps ──────────────────────────────────────────────────────────────

const CARD =
  "border border-input bg-white dark:bg-neutral-900/60 rounded-2xl dark:border-neutral-700 overflow-hidden";

const reportStatusCfg: Record<
  ReportStatus,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: "En attente",
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  resolved: {
    label: "Résolu",
    badge:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    dot: "bg-emerald-400",
  },
  ignored: {
    label: "Ignoré",
    badge:
      "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400",
    dot: "bg-slate-400",
  },
};
const reasonCfg: Record<ReportReason, { label: string; badge: string }> = {
  spam: {
    label: "Spam",
    badge:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
  },
  inappropriate: {
    label: "Inapproprié",
    badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  },
  fake: {
    label: "Faux contenu",
    badge:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  },
  harassment: {
    label: "Harcèlement",
    badge: "bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400",
  },
  other: {
    label: "Autre",
    badge:
      "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400",
  },
};
const contentTypeCfg: Record<
  ContentType,
  { icon: React.ReactNode; label: string }
> = {
  comment: {
    icon: <MessageSquare className="size-3.5" />,
    label: "Commentaire",
  },
  image: { icon: <Image className="size-3.5" />, label: "Image" },
  announcement: { icon: <Megaphone className="size-3.5" />, label: "Annonce" },
  publication: { icon: <Layers className="size-3.5" />, label: "Publication" },
  video: { icon: <FileText className="size-3.5" />, label: "Vidéo" },
};
const sanctionCfg: Record<
  SanctionType,
  { label: string; badge: string; icon: React.ReactNode }
> = {
  warning: {
    label: "Avertissement",
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    icon: <Bell className="size-3" />,
  },
  suspension: {
    label: "Suspension",
    badge:
      "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400",
    icon: <UserX className="size-3" />,
  },
  ban: {
    label: "Bannissement",
    badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    icon: <Ban className="size-3" />,
  },
  deletion: {
    label: "Suppression",
    badge:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    icon: <Trash2 className="size-3" />,
  },
};
const logLevelCfg: Record<
  LogLevel,
  { label: string; badge: string; dot: string }
> = {
  info: {
    label: "Info",
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    dot: "bg-blue-400",
  },
  warning: {
    label: "Warning",
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  error: {
    label: "Erreur",
    badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    dot: "bg-red-500",
  },
  critical: {
    label: "Critique",
    badge:
      "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 font-semibold",
    dot: "bg-red-600",
  },
};
const logCategoryCfg: Record<
  LogCategory,
  { label: string; icon: React.ReactNode }
> = {
  auth: { label: "Authentification", icon: <LogIn className="size-3.5" /> },
  admin: { label: "Action admin", icon: <Shield className="size-3.5" /> },
  permission: {
    label: "Permission",
    icon: <ShieldAlert className="size-3.5" />,
  },
  deletion: { label: "Suppression", icon: <Trash2 className="size-3.5" /> },
  server: { label: "Serveur", icon: <Server className="size-3.5" /> },
  modification: {
    label: "Modification",
    icon: <Settings className="size-3.5" />,
  },
};
const suspiciousCfg: Record<SuspiciousType, { label: string; desc: string }> = {
  brute_force: {
    label: "Force brute",
    desc: "Tentatives de connexion répétées",
  },
  unusual_api: {
    label: "API inhabituelle",
    desc: "Requêtes API anormales détectées",
  },
  mass_action: {
    label: "Action de masse",
    desc: "Actions en volume inhabituelles",
  },
  geo_anomaly: {
    label: "Anomalie géographique",
    desc: "Connexion depuis une zone inhabituelle",
  },
};
const notifTypeCfg: Record<
  NotifType,
  { icon: React.ReactNode; color: string }
> = {
  system: {
    icon: <Server className="size-4" />,
    color: "bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400",
  },
  moderation: {
    icon: <Flag className="size-4" />,
    color:
      "bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400",
  },
  payment: {
    icon: <FileText className="size-4" />,
    color:
      "bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  user: {
    icon: <Users className="size-4" />,
    color:
      "bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400",
  },
  security: {
    icon: <ShieldAlert className="size-4" />,
    color: "bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400",
  },
};
const priorityCfg: Record<"low" | "medium" | "high", { dot: string }> = {
  low: { dot: "bg-slate-300 dark:bg-neutral-600" },
  medium: { dot: "bg-amber-400" },
  high: { dot: "bg-red-500" },
};
const announcementStatusCfg: Record<
  AnnouncementStatus,
  { label: string; badge: string }
> = {
  published: {
    label: "Publié",
    badge:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  draft: {
    label: "Brouillon",
    badge:
      "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400",
  },
  archived: {
    label: "Archivé",
    badge:
      "bg-neutral-100 text-neutral-500 dark:bg-neutral-700/60 dark:text-neutral-500",
  },
  scheduled: {
    label: "Planifié",
    badge: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  },
};
const targetCfg: Record<
  AnnouncementTarget,
  { label: string; icon: React.ReactNode }
> = {
  all: { label: "Tout le monde", icon: <Globe className="size-3.5" /> },
  users: { label: "Utilisateurs", icon: <Users className="size-3.5" /> },
  businesses: {
    label: "Entreprises",
    icon: <Building2 className="size-3.5" />,
  },
  admins: { label: "Admins", icon: <Shield className="size-3.5" /> },
};

type TabKey =
  | "reports"
  | "sanctions"
  | "logs"
  | "suspicious"
  | "notifications"
  | "announcements";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Pill({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className={CARD}>
      <div className="p-4 flex flex-col gap-2.5">
        <span
          className={`size-8 rounded-xl flex items-center justify-center ${color}`}
        >
          <Icon className="size-4" />
        </span>
        <div>
          <p className="text-xl font-semibold text-neutral-800 dark:text-white tracking-tight">
            {value}
          </p>
          <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
            {label}
          </p>
          {sub && (
            <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
              {sub}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function iconBtn(
  title: string,
  colorCls: string,
  icon: React.ReactNode,
  onClick?: () => void,
) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={`size-7 rounded-lg flex items-center justify-center transition-colors ${colorCls}`}
    >
      {icon}
    </button>
  );
}

function initials(n: string) {
  return n
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// ─── Announce Form Modal ──────────────────────────────────────────────────────

function AnnounceForm({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (a: Announcement) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [target, setTarget] = useState<AnnouncementTarget>("all");
  const [pinned, setPinned] = useState(false);
  const [status, setStatus] = useState<"published" | "draft" | "scheduled">(
    "draft",
  );

  function handleSave(s: "published" | "draft") {
    if (!title.trim()) {
      toast.error("Le titre est requis.");
      return;
    }
    onSave({
      id: "a" + Date.now(),
      title,
      content,
      target,
      status: s,
      author: "Super Admin",
      createdAt: new Date().toISOString().slice(0, 10),
      publishedAt:
        s === "published" ? new Date().toISOString().slice(0, 10) : undefined,
      pinned,
      views: 0,
    });
    onClose();
    toast.success(
      s === "published" ? "Annonce publiée !" : "Brouillon enregistré.",
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-input dark:border-neutral-700 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-input dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <Megaphone className="size-4 text-amber-500 dark:text-amber-400" />
            </div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              Nouvelle annonce
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
              Titre *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Mise à jour importante de la plateforme…"
              className="w-full h-10 px-3 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
              Contenu
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Rédigez le contenu de votre annonce…"
              className="w-full px-3 py-2.5 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
                Destinataires
              </label>
              <select
                value={target}
                onChange={(e) =>
                  setTarget(e.target.value as AnnouncementTarget)
                }
                className="w-full h-10 px-3 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
              >
                <option value="all">Tout le monde</option>
                <option value="users">Utilisateurs</option>
                <option value="businesses">Entreprises</option>
                <option value="admins">Admins</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
                Épingler
              </label>
              <div className="h-10 flex items-center gap-2.5 px-3 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800">
                <Switch
                  checked={pinned}
                  onCheckedChange={setPinned}
                  className="data-[state=checked]:bg-amber-400"
                />
                <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
                  {pinned ? "Épinglé" : "Non épinglé"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-input dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-input dark:border-neutral-700 text-sm"
            onClick={() => handleSave("draft")}
          >
            <Archive className="size-3.5" /> Enregistrer brouillon
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-xl border-input dark:border-neutral-700 text-sm"
              onClick={onClose}
            >
              Annuler
            </Button>
            <Button
              variant="amber"
              size="sm"
              className="gap-2 rounded-xl text-sm"
              onClick={() => handleSave("published")}
            >
              <Send className="size-3.5" /> Publier maintenant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function ModerationPage() {
  const [tab, setTab] = useState<TabKey>("reports");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState<ReportStatus | "all">("all");
  const [levelFilter, setLevel] = useState<LogLevel | "all">("all");
  const [catFilter, setCat] = useState<LogCategory | "all">("all");
  const [showFilters, setFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [notifFilter, setNotifFilter] = useState<NotifType | "all">("all");
  const [announcementFilter, setAnnouncementFilter] = useState<
    AnnouncementStatus | "all"
  >("all");

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingReports = REPORTS.filter((r) => r.status === "pending").length;
  const activeSanctions = SANCTIONS.filter((s) => s.active).length;
  const criticalLogs = SYSTEM_LOGS.filter(
    (l) => l.level === "critical" || l.level === "error",
  ).length;
  const unresolvedAlerts = SUSPICIOUS.filter((s) => !s.resolved).length;

  const filteredReports = REPORTS.filter((r) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        r.reporter.toLowerCase().includes(q) ||
        r.reported.toLowerCase().includes(q) ||
        r.contentPreview.toLowerCase().includes(q)) &&
      (statusFilter === "all" || r.status === statusFilter)
    );
  });
  const filteredLogs = SYSTEM_LOGS.filter((l) => {
    const q = search.toLowerCase();
    return (
      (!q ||
        l.message.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.target.toLowerCase().includes(q)) &&
      (levelFilter === "all" || l.level === levelFilter) &&
      (catFilter === "all" || l.category === catFilter)
    );
  });
  const filteredSanctions = SANCTIONS.filter(
    (s) => !search || s.user.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredSuspicious = SUSPICIOUS.filter(
    (s) =>
      !search ||
      suspiciousCfg[s.type].label.toLowerCase().includes(search.toLowerCase()),
  );
  const filteredNotifs = notifications.filter(
    (n) =>
      (!search ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.message.toLowerCase().includes(search.toLowerCase())) &&
      (notifFilter === "all" || n.type === notifFilter),
  );
  const filteredAnnouncements = announcements.filter(
    (a) =>
      (!search || a.title.toLowerCase().includes(search.toLowerCase())) &&
      (announcementFilter === "all" || a.status === announcementFilter),
  );

  function markAllRead() {
    setNotifications((n) => n.map((x) => ({ ...x, read: true })));
    toast.success("Toutes les notifications marquées comme lues.");
  }
  function markRead(id: string) {
    setNotifications((n) =>
      n.map((x) => (x.id === id ? { ...x, read: true } : x)),
    );
  }
  function deleteNotif(id: string) {
    setNotifications((n) => n.filter((x) => x.id !== id));
  }

  function archiveAnnouncement(id: string) {
    setAnnouncements((a) =>
      a.map((x) =>
        x.id === id ? { ...x, status: "archived" as AnnouncementStatus } : x,
      ),
    );
    toast("Annonce archivée.");
  }
  function publishAnnouncement(id: string) {
    setAnnouncements((a) =>
      a.map((x) =>
        x.id === id
          ? {
              ...x,
              status: "published" as AnnouncementStatus,
              publishedAt: new Date().toISOString().slice(0, 10),
            }
          : x,
      ),
    );
    toast.success("Annonce publiée !");
  }
  function deleteAnnouncement(id: string) {
    setAnnouncements((a) => a.filter((x) => x.id !== id));
    toast("Annonce supprimée.");
  }

  const TABS: {
    key: TabKey;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    {
      key: "reports",
      label: "Signalements",
      icon: Flag,
      count: pendingReports,
    },
    { key: "sanctions", label: "Sanctions", icon: ShieldAlert },
    { key: "logs", label: "Logs système", icon: ScrollText },
    {
      key: "suspicious",
      label: "Activités suspectes",
      icon: AlertTriangle,
      count: unresolvedAlerts,
    },
    {
      key: "notifications",
      label: "Notifications",
      icon: Bell,
      count: unreadCount,
    },
    { key: "announcements", label: "Annonces", icon: Megaphone },
  ];

  const currentCount =
    tab === "reports"
      ? filteredReports.length
      : tab === "logs"
        ? filteredLogs.length
        : tab === "sanctions"
          ? filteredSanctions.length
          : tab === "suspicious"
            ? filteredSuspicious.length
            : tab === "notifications"
              ? filteredNotifs.length
              : filteredAnnouncements.length;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] overflow-hidden">
      {showForm && (
        <AnnounceForm
          onClose={() => setShowForm(false)}
          onSave={(a) => setAnnouncements((p) => [a, ...p])}
        />
      )}

      {/* KPIs */}
      <div className="px-6 pt-5 pb-4 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <KpiCard
            icon={Flag}
            label="Signalements"
            value={pendingReports}
            sub="en attente"
            color="bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400"
          />
          <KpiCard
            icon={ShieldAlert}
            label="Sanctions"
            value={activeSanctions}
            sub="actives"
            color="bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Alertes"
            value={unresolvedAlerts}
            sub="non résolues"
            color="bg-orange-50 text-orange-500 dark:bg-orange-500/10 dark:text-orange-400"
          />
          <KpiCard
            icon={AlertCircle}
            label="Erreurs système"
            value={criticalLogs}
            sub="logs critiques"
            color="bg-violet-50 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400"
          />
          <KpiCard
            icon={Bell}
            label="Notifications"
            value={unreadCount}
            sub="non lues"
            color="bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
          />
          <KpiCard
            icon={Megaphone}
            label="Annonces"
            value={announcements.filter((a) => a.status === "published").length}
            sub="publiées"
            color="bg-emerald-50 text-emerald-500 dark:bg-emerald-500/10 dark:text-emerald-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 shrink-0 flex items-center gap-0 border-b border-input dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setSearch("");
              setFilters(false);
            }}
            className={`relative flex items-center gap-2 px-4 py-3 text-[13px] font-medium transition-colors ${tab === t.key ? "text-amber-500 dark:text-amber-400" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"}`}
          >
            <t.icon className="size-3.5 shrink-0" />
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${tab === t.key ? "bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"}`}
              >
                {t.count}
              </span>
            )}
            {tab === t.key && (
              <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-amber-400 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="px-6 py-3 border-b border-input dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <Input
              placeholder="Rechercher…"
              className="pl-9 h-9 bg-slate-50 dark:bg-neutral-800 border-slate-200 dark:border-neutral-700 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {tab !== "announcements" && tab !== "notifications" && (
            <Button
              variant="outline"
              size="sm"
              className={`h-9 gap-2 text-sm border-slate-200 dark:border-neutral-700 ${showFilters ? "border-amber-400 text-amber-500 ring-2 ring-amber-500/20" : "text-neutral-600 dark:text-neutral-400"}`}
              onClick={() => setFilters(!showFilters)}
            >
              <SlidersHorizontal className="size-4" /> Filtres
            </Button>
          )}

          {tab === "notifications" && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {(
                [
                  "all",
                  "security",
                  "moderation",
                  "payment",
                  "user",
                  "system",
                ] as const
              ).map((v) => (
                <button
                  key={v}
                  onClick={() => setNotifFilter(v)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${notifFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                >
                  {v === "all"
                    ? "Tous"
                    : notifTypeCfg[v as NotifType].icon && (
                        <>
                          {v === "security"
                            ? "Sécurité"
                            : v === "moderation"
                              ? "Modération"
                              : v === "payment"
                                ? "Paiement"
                                : v === "user"
                                  ? "Utilisateur"
                                  : "Système"}
                        </>
                      )}
                </button>
              ))}
            </div>
          )}

          {tab === "announcements" && (
            <div className="flex items-center gap-1.5">
              {(
                ["all", "published", "draft", "scheduled", "archived"] as const
              ).map((v) => (
                <button
                  key={v}
                  onClick={() => setAnnouncementFilter(v)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${announcementFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                >
                  {v === "all" ? "Tous" : announcementStatusCfg[v].label}
                </button>
              ))}
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-neutral-400 dark:text-neutral-500">
              {currentCount} éléments
            </span>
            {tab === "notifications" && unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-sm border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
                onClick={markAllRead}
              >
                <CheckCircle2 className="size-3.5" /> Tout lire
              </Button>
            )}
            {tab === "announcements" && (
              <Button
                variant="amber"
                size="sm"
                className="h-9 gap-2 rounded-xl text-sm"
                onClick={() => setShowForm(true)}
              >
                <Plus className="size-4" /> Nouvelle annonce
              </Button>
            )}
            {tab !== "announcements" && tab !== "notifications" && (
              <Button
                variant="outline"
                size="sm"
                className="h-9 gap-2 text-sm border-slate-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400"
              >
                <Download className="size-4" /> Exporter
              </Button>
            )}
          </div>
        </div>

        {showFilters && tab === "reports" && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <span className="text-[11px] text-neutral-400">Statut :</span>
            {(["all", "pending", "resolved", "ignored"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setStatus(v)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${statusFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
              >
                {v === "all" ? "Tous" : reportStatusCfg[v].label}
              </button>
            ))}
          </div>
        )}
        {showFilters && tab === "logs" && (
          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Niveau :</span>
              {(["all", "info", "warning", "error", "critical"] as const).map(
                (v) => (
                  <button
                    key={v}
                    onClick={() => setLevel(v)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${levelFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                  >
                    {v === "all" ? "Tous" : logLevelCfg[v].label}
                  </button>
                ),
              )}
            </div>
            <Separator
              orientation="vertical"
              className="h-5 dark:bg-neutral-700"
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-neutral-400">Catégorie :</span>
              {(
                [
                  "all",
                  "auth",
                  "admin",
                  "permission",
                  "deletion",
                  "server",
                  "modification",
                ] as const
              ).map((v) => (
                <button
                  key={v}
                  onClick={() => setCat(v)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${catFilter === v ? "bg-amber-400 text-white" : "bg-slate-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700"}`}
                >
                  {v === "all" ? "Tous" : logCategoryCfg[v].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* REPORTS */}
        {tab === "reports" && (
          <>
            <div className="px-6 py-2.5 grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_100px] gap-3 border-b border-input dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/80 sticky top-0 z-10">
              {[
                "Signalé par",
                "Contenu",
                "Type",
                "Raison",
                "Statut",
                "Actions",
              ].map((h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
                >
                  {h}
                </p>
              ))}
            </div>
            <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
              {filteredReports.map((r) => {
                const st = reportStatusCfg[r.status];
                const rs = reasonCfg[r.reason];
                const ct = contentTypeCfg[r.contentType];
                return (
                  <div
                    key={r.id}
                    className="px-6 py-3.5 grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_100px] gap-3 items-start hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="size-7 shrink-0">
                        <AvatarImage src={r.reporterAvatar} />
                        <AvatarFallback className="bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 text-[10px] font-bold">
                          {initials(r.reporter)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-[12px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                          {r.reporter}
                        </p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {r.date}
                        </p>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] text-neutral-600 dark:text-neutral-300 truncate">
                        {r.contentPreview}
                      </p>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">
                        {r.workspace}
                      </p>
                      {r.proofs > 0 && (
                        <span className="text-[10px] text-violet-500 dark:text-violet-400">
                          {r.proofs} preuve{r.proofs > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <Pill className="bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-300 self-start mt-0.5">
                      {ct.icon}
                      {ct.label}
                    </Pill>
                    <Pill className={`self-start mt-0.5 ${rs.badge}`}>
                      {rs.label}
                    </Pill>
                    <Pill className={`self-start mt-0.5 ${st.badge}`}>
                      <span className={`size-1.5 rounded-full ${st.dot}`} />
                      {st.label}
                    </Pill>
                    <div className="flex items-center gap-1">
                      {iconBtn(
                        "Voir",
                        "text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800",
                        <Eye className="size-3.5" />,
                      )}
                      {r.status === "pending" && (
                        <>
                          {iconBtn(
                            "Ignorer",
                            "text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800",
                            <CheckCircle2 className="size-3.5" />,
                            () => toast("Signalement ignoré."),
                          )}
                          {iconBtn(
                            "Avertir",
                            "text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10",
                            <Bell className="size-3.5" />,
                            () => toast("Avertissement envoyé."),
                          )}
                          {iconBtn(
                            "Suspendre",
                            "text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10",
                            <UserX className="size-3.5" />,
                            () => toast("Utilisateur suspendu."),
                          )}
                          {iconBtn(
                            "Bannir",
                            "text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10",
                            <Ban className="size-3.5" />,
                            () => toast.error("Utilisateur banni."),
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* SANCTIONS */}
        {tab === "sanctions" && (
          <>
            <div className="px-6 py-2.5 grid grid-cols-[2fr_1fr_2fr_1.2fr_0.8fr_70px] gap-3 border-b border-input dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/80 sticky top-0 z-10">
              {[
                "Utilisateur",
                "Sanction",
                "Raison",
                "Prononcé par",
                "Statut",
                "",
              ].map((h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
                >
                  {h}
                </p>
              ))}
            </div>
            <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
              {filteredSanctions.map((s) => {
                const sc = sanctionCfg[s.type];
                return (
                  <div
                    key={s.id}
                    className="px-6 py-3.5 grid grid-cols-[2fr_1fr_2fr_1.2fr_0.8fr_70px] gap-3 items-center hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="size-7 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-[10px] font-bold text-red-500 dark:text-red-400 shrink-0">
                        {initials(s.user)}
                      </div>
                      <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                        {s.user}
                      </p>
                    </div>
                    <Pill className={sc.badge}>
                      {sc.icon}
                      {sc.label}
                    </Pill>
                    <p className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate">
                      {s.reason}
                    </p>
                    <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                      {s.admin}
                    </p>
                    <Pill
                      className={
                        s.active
                          ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          : "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400"
                      }
                    >
                      {s.active ? "Active" : "Levée"}
                    </Pill>
                    <div className="flex items-center gap-1">
                      {iconBtn(
                        "Voir",
                        "text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800",
                        <Eye className="size-3.5" />,
                      )}
                      {s.active &&
                        iconBtn(
                          "Lever",
                          "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
                          <RefreshCw className="size-3.5" />,
                          () => toast.success("Sanction levée."),
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* LOGS */}
        {tab === "logs" && (
          <>
            <div className="px-6 py-2.5 grid grid-cols-[0.6fr_0.8fr_2fr_1.2fr_1.2fr_1fr] gap-3 border-b border-input dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/80 sticky top-0 z-10">
              {[
                "Niveau",
                "Catégorie",
                "Message",
                "Acteur",
                "Cible",
                "Date",
              ].map((h) => (
                <p
                  key={h}
                  className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
                >
                  {h}
                </p>
              ))}
            </div>
            <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
              {filteredLogs.map((l) => {
                const lv = logLevelCfg[l.level];
                const cat = logCategoryCfg[l.category];
                return (
                  <div
                    key={l.id}
                    className={`px-6 py-3 grid grid-cols-[0.6fr_0.8fr_2fr_1.2fr_1.2fr_1fr] gap-3 items-center hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors ${l.level === "critical" ? "border-l-2 border-red-400" : "border-l-2 border-transparent"}`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`size-2 rounded-full shrink-0 ${lv.dot}`}
                      />
                      <Pill className={lv.badge}>{lv.label}</Pill>
                    </div>
                    <Pill className="bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-300 self-start">
                      {cat.icon}
                      {cat.label}
                    </Pill>
                    <p className="text-[12px] text-neutral-700 dark:text-neutral-200 truncate">
                      {l.message}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                      {l.actor}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate font-mono">
                      {l.target}
                    </p>
                    <div>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {l.date}
                      </p>
                      <p className="text-[10px] text-neutral-300 dark:text-neutral-600 font-mono">
                        {l.ip}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* SUSPICIOUS */}
        {tab === "suspicious" && (
          <div className="p-6 space-y-3">
            {filteredSuspicious.map((sp) => {
              const cfg = suspiciousCfg[sp.type];
              return (
                <div
                  key={sp.id}
                  className={`flex items-start justify-between gap-4 p-4 rounded-xl border transition-colors ${sp.resolved ? "border-input dark:border-neutral-700 opacity-60" : "border-red-200 dark:border-red-500/20 bg-red-50/30 dark:bg-red-500/5"}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${sp.resolved ? "bg-slate-100 dark:bg-neutral-800" : "bg-red-100 dark:bg-red-500/10"}`}
                    >
                      <AlertTriangle
                        className={`size-4 ${sp.resolved ? "text-neutral-400" : "text-red-500"}`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200">
                          {cfg.label}
                        </p>
                        <Pill
                          className={
                            sp.resolved
                              ? "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400"
                              : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                          }
                        >
                          {sp.resolved ? "Résolu" : "Actif"}
                        </Pill>
                      </div>
                      <p className="text-[12px] text-neutral-500 dark:text-neutral-400">
                        {cfg.desc}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                          {sp.source}
                        </span>
                        {sp.user && (
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            · {sp.user}
                          </span>
                        )}
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                          · {sp.count} occurrence{sp.count > 1 ? "s" : ""}
                        </span>
                        <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                          · {sp.date}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!sp.resolved && (
                    <div className="flex items-center gap-2 shrink-0">
                      {iconBtn(
                        "Bloquer l'IP",
                        "text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10",
                        <Ban className="size-3.5" />,
                        () => toast.error("IP bloquée."),
                      )}
                      {iconBtn(
                        "Marquer résolu",
                        "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
                        <CheckCircle2 className="size-3.5" />,
                        () => toast.success("Marqué comme résolu."),
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NOTIFICATIONS */}
        {tab === "notifications" && (
          <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
            {filteredNotifs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <Bell className="size-10 opacity-30 mb-3" />
                <p className="text-sm">Aucune notification</p>
              </div>
            )}
            {filteredNotifs.map((n) => {
              const t = notifTypeCfg[n.type];
              const p = priorityCfg[n.priority];
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-6 py-4 hover:bg-slate-50/80 dark:hover:bg-neutral-800/40 transition-colors ${!n.read ? "bg-blue-50/20 dark:bg-blue-500/5" : ""}`}
                  onClick={() => markRead(n.id)}
                >
                  <div
                    className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${t.color}`}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p
                        className={`text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate ${!n.read ? "font-semibold" : ""}`}
                      >
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                      <span
                        className={`size-2 rounded-full shrink-0 ${p.dot}`}
                      />
                    </div>
                    <p className="text-[12px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
                      {n.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read &&
                      iconBtn(
                        "Marquer lu",
                        "text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10",
                        <CheckCircle2 className="size-3.5" />,
                        () => markRead(n.id),
                      )}
                    {iconBtn(
                      "Supprimer",
                      "text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10",
                      <Trash2 className="size-3.5" />,
                      () => deleteNotif(n.id),
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <div className="p-6 space-y-3">
            {filteredAnnouncements.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <Megaphone className="size-10 opacity-30 mb-3" />
                <p className="text-sm">Aucune annonce</p>
                <Button
                  variant="amber"
                  size="sm"
                  className="mt-4 gap-2 rounded-xl"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="size-3.5" />
                  Créer une annonce
                </Button>
              </div>
            )}
            {filteredAnnouncements.map((a) => {
              const s = announcementStatusCfg[a.status];
              const tg = targetCfg[a.target];
              return (
                <div
                  key={a.id}
                  className={`${CARD} p-4 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      {/* Pin indicator */}
                      {a.pinned && (
                        <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Pin className="size-4 text-amber-500 dark:text-amber-400" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="text-[14px] font-semibold text-neutral-800 dark:text-neutral-100 truncate">
                            {a.title}
                          </p>
                          <Pill className={s.badge}>{s.label}</Pill>
                          <Pill className="bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-300">
                            {tg.icon}
                            {tg.label}
                          </Pill>
                        </div>
                        <p className="text-[12px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                          {a.content}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            Par {a.author}
                          </span>
                          <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                            Créé le {a.createdAt}
                          </span>
                          {a.publishedAt && (
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                              Publié le {a.publishedAt}
                            </span>
                          )}
                          {a.scheduledAt && (
                            <span className="text-[11px] text-blue-500 dark:text-blue-400 flex items-center gap-1">
                              <Clock className="size-3" />
                              Planifié {a.scheduledAt}
                            </span>
                          )}
                          {a.views > 0 && (
                            <span className="text-[11px] text-neutral-400 dark:text-neutral-500">
                              {a.views.toLocaleString("fr-FR")} vues
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {iconBtn(
                        "Modifier",
                        "text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800",
                        <Edit2 className="size-3.5" />,
                      )}
                      {a.status === "draft" &&
                        iconBtn(
                          "Publier",
                          "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
                          <Send className="size-3.5" />,
                          () => publishAnnouncement(a.id),
                        )}
                      {a.status === "published" &&
                        iconBtn(
                          "Archiver",
                          "text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10",
                          <Archive className="size-3.5" />,
                          () => archiveAnnouncement(a.id),
                        )}
                      {iconBtn(
                        "Supprimer",
                        "text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10",
                        <Trash2 className="size-3.5" />,
                        () => deleteAnnouncement(a.id),
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
