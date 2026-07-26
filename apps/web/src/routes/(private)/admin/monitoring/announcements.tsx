import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
// import { Switch } from "#/components/ui/switch";
import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  Building2,
  Clock,
  Edit2,
  Globe,
  Megaphone,
  Pin,
  Plus,
  Send,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/(private)/admin/monitoring/announcements",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState(INITIAL_ANNOUNCEMENTS);

  const [announcementFilter, setAnnouncementFilter] = useState<
    AnnouncementStatus | "all"
  >("all");

  const filteredAnnouncements = announcements.filter(
    (a) =>
      (!search || a.title.toLowerCase().includes(search.toLowerCase())) &&
      (announcementFilter === "all" || a.status === announcementFilter),
  );

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

  return (
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
            className={`border border-input bg-white dark:bg-neutral-900/60 rounded-2xl dark:border-neutral-700 overflow-hidden p-4 hover:border-amber-300 dark:hover:border-amber-500/40 transition-colors`}
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
                    <Badge className={s.badge}>{s.label}</Badge>
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-neutral-700/50 dark:text-neutral-300">
                      {tg.icon}
                      {tg.label}
                    </Badge>
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
// function AnnounceForm({
//   onClose,
//   onSave,
// }: {
//   onClose: () => void;
//   onSave: (a: Announcement) => void;
// }) {
//   const [title, setTitle] = useState("");
//   const [content, setContent] = useState("");
//   const [target, setTarget] = useState<AnnouncementTarget>("all");
//   const [pinned, setPinned] = useState(false);
//   // const [status, setStatus] = useState<"published" | "draft" | "scheduled">(
//   //   "draft",
//   // );

//   function handleSave(s: "published" | "draft") {
//     if (!title.trim()) {
//       toast.error("Le titre est requis.");
//       return;
//     }
//     onSave({
//       id: "a" + Date.now(),
//       title,
//       content,
//       target,
//       status: s,
//       author: "Super Admin",
//       createdAt: new Date().toISOString().slice(0, 10),
//       publishedAt:
//         s === "published" ? new Date().toISOString().slice(0, 10) : undefined,
//       pinned,
//       views: 0,
//     });
//     onClose();
//     toast.success(
//       s === "published" ? "Annonce publiée !" : "Brouillon enregistré.",
//     );
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 dark:bg-black/50 backdrop-blur-sm">
//       <div className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-input dark:border-neutral-700 shadow-xl overflow-hidden">
//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-input dark:border-neutral-800">
//           <div className="flex items-center gap-2.5">
//             <div className="size-8 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
//               <Megaphone className="size-4 text-amber-500 dark:text-amber-400" />
//             </div>
//             <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
//               Nouvelle annonce
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="size-7 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
//           >
//             <X className="size-4" />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="px-6 py-5 space-y-4">
//           <div className="space-y-1.5">
//             <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
//               Titre *
//             </label>
//             <input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               placeholder="Ex: Mise à jour importante de la plateforme…"
//               className="w-full h-10 px-3 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
//             />
//           </div>
//           <div className="space-y-1.5">
//             <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
//               Contenu
//             </label>
//             <textarea
//               value={content}
//               onChange={(e) => setContent(e.target.value)}
//               rows={4}
//               placeholder="Rédigez le contenu de votre annonce…"
//               className="w-full px-3 py-2.5 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm text-neutral-800 dark:text-neutral-100 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all resize-none"
//             />
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-1.5">
//               <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
//                 Destinataires
//               </label>
//               <select
//                 value={target}
//                 onChange={(e) =>
//                   setTarget(e.target.value as AnnouncementTarget)
//                 }
//                 className="w-full h-10 px-3 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800 text-sm text-neutral-700 dark:text-neutral-200 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all"
//               >
//                 <option value="all">Tout le monde</option>
//                 <option value="users">Utilisateurs</option>
//                 <option value="businesses">Entreprises</option>
//                 <option value="admins">Admins</option>
//               </select>
//             </div>
//             <div className="space-y-1.5">
//               <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-300">
//                 Épingler
//               </label>
//               <div className="h-10 flex items-center gap-2.5 px-3 rounded-xl border border-input dark:border-neutral-700 bg-slate-50 dark:bg-neutral-800">
//                 <Switch
//                   checked={pinned}
//                   onCheckedChange={setPinned}
//                   className="data-[state=checked]:bg-amber-400"
//                 />
//                 <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
//                   {pinned ? "Épinglé" : "Non épinglé"}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-input dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50">
//           <Button
//             variant="outline"
//             size="sm"
//             className="gap-2 rounded-xl border-input dark:border-neutral-700 text-sm"
//             onClick={() => handleSave("draft")}
//           >
//             <Archive className="size-3.5" /> Enregistrer brouillon
//           </Button>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               size="sm"
//               className="gap-2 rounded-xl border-input dark:border-neutral-700 text-sm"
//               onClick={onClose}
//             >
//               Annuler
//             </Button>
//             <Button
//               variant="amber"
//               size="sm"
//               className="gap-2 rounded-xl text-sm"
//               onClick={() => handleSave("published")}
//             >
//               <Send className="size-3.5" /> Publier maintenant
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

type AnnouncementTarget = "all" | "users" | "businesses" | "admins";
type AnnouncementStatus = "published" | "draft" | "archived" | "scheduled";
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
