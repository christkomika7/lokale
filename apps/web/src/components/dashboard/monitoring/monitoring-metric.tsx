import MetricCard from "#/components/card/metric-card";
import CardContainer from "#/components/layout/card-container";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  Flag,
  Megaphone,
  ShieldAlert,
} from "lucide-react";
import { useState } from "react";

export default function MonitoringMetric() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);
  const [reports, setReports] = useState(REPORTS);
  const [sanctions, setSanctions] = useState(SANCTIONS);
  const [systemLogs, setSystemLogs] = useState(SYSTEM_LOGS);
  const [suspicious, setSuspicious] = useState(SUSPICIOUS);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const activeSanctions = sanctions.filter((s) => s.active).length;
  const criticalLogs = systemLogs.filter(
    (l) => l.level === "critical" || l.level === "error",
  ).length;
  const unresolvedAlerts = SUSPICIOUS.filter((s) => !s.resolved).length;

  return (
    <div className="px-6 pt-5 pb-4 shrink-0">
      <CardContainer>
        <MetricCard
          variant="warning"
          icon={Flag}
          label="Signalements"
          value={pendingReports}
          sub="en attente"
        />

        <MetricCard
          variant="danger"
          icon={ShieldAlert}
          label="Sanctions"
          value={activeSanctions}
          sub="actives"
        />

        <MetricCard
          variant="orange"
          icon={AlertTriangle}
          label="Alertes"
          value={unresolvedAlerts}
          sub="non résolues"
        />

        <MetricCard
          variant="mauve"
          icon={AlertCircle}
          label="Erreurs système"
          value={criticalLogs}
          sub="logs critiques"
        />

        <MetricCard
          variant="info"
          icon={Bell}
          label="Notifications"
          value={unreadCount}
          sub="non lues"
        />

        <MetricCard
          variant="purple"
          icon={Megaphone}
          label="Annonces"
          value={announcements.filter((a) => a.status === "published").length}
          sub="publiées"
        />
      </CardContainer>
    </div>
  );
}

type NotifType = "system" | "moderation" | "payment" | "user" | "security";

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

type AnnouncementStatus = "published" | "draft" | "archived" | "scheduled";
type AnnouncementTarget = "all" | "users" | "businesses" | "admins";

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

type LogLevel = "info" | "warning" | "error" | "critical";
type LogCategory =
  | "auth"
  | "admin"
  | "permission"
  | "deletion"
  | "server"
  | "modification";

type SuspiciousActivity = {
  id: string;
  type: SuspiciousType;
  source: string;
  user?: string;
  count: number;
  date: string;
  resolved: boolean;
};

type SuspiciousType =
  | "brute_force"
  | "unusual_api"
  | "mass_action"
  | "geo_anomaly";

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

type Sanction = {
  id: string;
  user: string;
  type: SanctionType;
  reason: string;
  admin: string;
  date: string;
  active: boolean;
};

type SanctionType = "warning" | "suspension" | "ban" | "deletion";

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
type ReportStatus = "pending" | "resolved" | "ignored";
type ReportReason = "spam" | "inappropriate" | "fake" | "harassment" | "other";
type ContentType =
  | "comment"
  | "image"
  | "announcement"
  | "publication"
  | "video";
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
