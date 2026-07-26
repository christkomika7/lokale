import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { initials } from "#/lib/utils";
import { createFileRoute } from "@tanstack/react-router";
import {
  FileText,
  Layers,
  Megaphone,
  MessageSquare,
  Image,
  Eye,
  CheckCircle2,
  Bell,
  UserX,
  Ban,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/(private)/admin/monitoring/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState<ReportStatus | "all">("all");
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

  return (
    <div className="flex-1">
      <div className="px-6 py-2.5 grid grid-cols-[2fr_1.5fr_1fr_1fr_0.8fr_100px] gap-3 border-b border-input dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-900/80 sticky top-0 z-10">
        {["Signalé par", "Contenu", "Type", "Raison", "Statut", "Actions"].map(
          (h) => (
            <p
              key={h}
              className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
            >
              {h}
            </p>
          ),
        )}
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
              <Badge className="bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-300 self-start mt-0.5">
                {ct.icon}
                {ct.label}
              </Badge>
              <Badge className={`self-start mt-0.5 ${rs.badge}`}>
                {rs.label}
              </Badge>
              <Badge className={`self-start mt-0.5 ${st.badge}`}>
                <span className={`size-1.5 rounded-full ${st.dot}`} />
                {st.label}
              </Badge>
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
    </div>
  );
}

type ReportReason = "spam" | "inappropriate" | "fake" | "harassment" | "other";
type ReportStatus = "pending" | "resolved" | "ignored";
type ContentType =
  | "comment"
  | "image"
  | "announcement"
  | "publication"
  | "video";

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
