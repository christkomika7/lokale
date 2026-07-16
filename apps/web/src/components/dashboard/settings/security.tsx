import {
  AlertTriangle,
  FileText,
  Monitor,
  RefreshCw,
  Save,
  ScanLine,
} from "lucide-react";
import { useState } from "react";
import type { AuditLog, SessionDevice } from "@lokale/types/admin";
import { toast } from "sonner";
import Heading from "#/components/typography/heading";
import DetailField from "#/components/ui/detail-field";
import { Switch } from "#/components/ui/switch";
import Input from "#/components/input/input";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import AlertMessage from "#/components/alert/alert-message";

const SESSIONS: SessionDevice[] = [
  {
    id: "s1",
    device: "MacBook Pro",
    browser: "Chrome 120",
    ip: "197.243.12.4",
    location: "Brazzaville, CG",
    lastActive: "Maintenant",
    current: true,
  },
  {
    id: "s2",
    device: "iPhone 14",
    browser: "Safari 17",
    ip: "197.243.18.9",
    location: "Pointe-Noire, CG",
    lastActive: "Il y a 2h",
    current: false,
  },
  {
    id: "s3",
    device: "Windows PC",
    browser: "Firefox 121",
    ip: "41.202.219.14",
    location: "Dolisie, CG",
    lastActive: "Il y a 1j",
    current: false,
  },
  {
    id: "s4",
    device: "iPad Pro",
    browser: "Chrome 120",
    ip: "102.244.51.8",
    location: "Paris, FR",
    lastActive: "Il y a 3j",
    current: false,
  },
];

export default function Security() {
  const [twoFa, setTwoFa] = useState(true);
  const [sessions, setSessions] = useState(SESSIONS);

  const [oauth, setOauth] = useState({ google: true, facebook: false });
  const [rateLimit, setRateLimit] = useState(true);
  const isLoading = false;

  function revokeSession(id: string) {
    setSessions((s) => s.filter((x) => x.id !== id));
    toast.success("Session révoquée.");
  }
  return (
    <div className="space-y-3">
      <div className="border py-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <Heading className="px-3">Providers OAuth</Heading>
        <div className="divide-y divide-slate-50 dark:divide-neutral-700">
          <div className="px-3">
            {[
              {
                key: "google" as const,
                label: "Google OAuth",
                hint: "Connexion via compte Google.",
              },
              {
                key: "facebook" as const,
                label: "Facebook OAuth",
                hint: "Connexion via compte Facebook.",
              },
            ].map((p) => (
              <DetailField
                key={p.key}
                label={p.label}
                value={
                  <div className="flex justify-between gap-2 mb-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {p.hint}
                    </span>
                    <Switch
                      checked={!!oauth[p.key]}
                      onCheckedChange={(v) =>
                        setOauth((o) => ({ ...o, [p.key]: v }))
                      }
                    />
                  </div>
                }
              >
                <div className="space-y-3 flex flex-col items-end">
                  {oauth[p.key] && (
                    <div className="space-y-2 w-full">
                      <Input
                        placeholder="Client ID"
                        className="h-9 rounded-md"
                        value=""
                        onChange={() => {}}
                      />
                      <Input
                        placeholder="Client Secret"
                        type="password"
                        className="h-9 rounded-md"
                        value=""
                        onChange={() => {}}
                      />
                    </div>
                  )}
                </div>
              </DetailField>
            ))}
          </div>
          <div className="px-3">
            <DetailField
              label="Rate Limiting"
              value="Limite le nombre de requêtes par IP (100/min par défaut)."
              layout="row"
            >
              <Switch checked={rateLimit} onCheckedChange={setRateLimit} />
            </DetailField>
          </div>
          <div className="px-3">
            <DetailField
              label="Limite d'upload"
              value="Taille maximale des fichiers uploadés par les utilisateurs."
            >
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value=""
                  placeholder="Ex: 10"
                  onChange={() => {}}
                  type="number"
                  className="h-9 rounded-md w-fit"
                />
                <span className="text-sm text-neutral-500 dark:text-neutral-400">
                  Mo
                </span>
              </div>
            </DetailField>
          </div>
        </div>
        <div className="flex justify-end px-3 pt-3 mt-2 border-t border-input dark:border-neutral-700">
          <Button variant="amber" className="rounded-md gap-2 text-sm">
            {isLoading ? (
              <RefreshCw className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            Enregistrer les modifications
          </Button>
        </div>
      </div>
      <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <Heading>Double authentification (2FA)</Heading>
        <DetailField
          label="Activer le 2FA"
          value="Ajoute une couche de sécurité supplémentaire à votre connexion admin."
          layout="row"
        >
          <div className="flex items-center gap-3">
            <Switch
              checked={twoFa}
              onCheckedChange={(v) => {
                setTwoFa(v);
                toast(v ? "2FA activé" : "2FA désactivé");
              }}
            />
          </div>
        </DetailField>
        {twoFa && (
          <div className="mt-4 p-4 rounded-md bg-slate-50 dark:bg-neutral-800/60 border border-input dark:border-neutral-700 flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
                Application d'authentification
              </p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-100 mt-0.5">
                Google Authenticator / Authy
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-md gap-2 border-input dark:border-neutral-700 text-sm"
            >
              <ScanLine className="size-3.5" /> Reconfigurer
            </Button>
          </div>
        )}
      </div>
      <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Heading>Sessions actives</Heading>
          <button
            onClick={() => {
              setSessions((s) => s.filter((x) => x.current));
              toast.success("Toutes les autres sessions révoquées.");
            }}
            className="text-[12px] font-medium text-red-500 hover:text-red-600 transition-colors"
          >
            Révoquer toutes les autres
          </button>
        </div>
        <div className="space-y-2">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`flex items-center gap-3 p-3.5 rounded-md border transition-colors ${s.current ? "border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/5" : "border-input dark:border-neutral-700 hover:border-amber-200 dark:hover:border-amber-500/20"}`}
            >
              <div
                className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${s.current ? "bg-amber-100 dark:bg-amber-500/20" : "bg-slate-100 dark:bg-neutral-800"}`}
              >
                <Monitor
                  className={`size-4 ${s.current ? "text-amber-500 dark:text-amber-400" : "text-neutral-400"}`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
                    {s.device}
                  </p>
                  {s.current && (
                    <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                      Session actuelle
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate">
                  {s.browser} · {s.ip} · {s.location}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {s.lastActive}
                </p>
                {!s.current && (
                  <button
                    onClick={() => revokeSession(s.id)}
                    className="text-[11px] font-medium text-red-400 hover:text-red-600 transition-colors mt-0.5"
                  >
                    Révoquer
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activités suspectes */}
      <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <Heading>Détection d'activités suspectes</Heading>
        <div className="space-y-2">
          {SUSPICIOUS.map((sp) => (
            <div
              key={sp.id}
              className={`flex items-start justify-between gap-3 p-3.5 rounded-md border ${sp.resolved ? "border-input dark:border-neutral-700 opacity-60" : "border-red-200 dark:border-red-500/20 bg-red-50/40 dark:bg-red-500/5"}`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`size-4 mt-0.5 shrink-0 ${sp.resolved ? "text-neutral-400" : "text-red-500"}`}
                />
                <div>
                  <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
                    {sp.type}
                  </p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {sp.source} · {sp.count} tentatives · {sp.date}
                  </p>
                </div>
              </div>
              <Badge
                className={
                  sp.resolved
                    ? "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400"
                    : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                }
              >
                {sp.resolved ? "Résolu" : "Actif"}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Logs */}
      <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <Heading>Journaux d'audit</Heading>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-md border-input dark:border-neutral-700 text-sm"
          >
            <FileText className="size-3.5" /> Exporter
          </Button>
        </div>
        <div className="divide-y divide-slate-50 dark:divide-neutral-800/60">
          {AUDIT_LOGS.map((log) => {
            const s = severityCfg[log.severity];
            return (
              <div key={log.id} className="flex items-start gap-3 py-3">
                <span
                  className={`mt-1.5 size-2 rounded-full shrink-0 ${s.dot}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
                      {log.action}
                    </p>
                    <Badge className={s.badge}>
                      {log.severity === "high"
                        ? "Critique"
                        : log.severity === "medium"
                          ? "Modéré"
                          : "Faible"}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate mt-0.5">
                    {log.target}
                  </p>
                  <p className="text-[10px] text-neutral-300 dark:text-neutral-600 mt-0.5">
                    {log.admin} · {log.ip} · {log.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="border p-3 border-input bg-white/80 dark:bg-neutral-900/30 rounded-lg">
        <Heading>Zone critique</Heading>
        <div className="space-y-3">
          <AlertMessage
            type="warning"
            title="Bloquer mon compte admin"
            description="Désactive temporairement l'accès à ce compte. Nécessite une intervention d'un super admin pour débloquer."
            command={{ title: "Bloquer", action: () => {} }}
          />
          <AlertMessage
            type="error"
            title="Supprimer définitivement mon compte"
            description="Suppression définitive et irréversible. Toutes les données associées seront effacées après 30 jours."
            command={{ title: "Supprimer", action: () => {} }}
          />
        </div>
      </div>
    </div>
  );
}

const AUDIT_LOGS: AuditLog[] = [
  {
    id: "a1",
    action: "Utilisateur suspendu",
    admin: "Super Admin",
    target: "Arlette Massamba (#u3)",
    ip: "197.243.12.4",
    date: "2025-01-10 14:32",
    severity: "high",
  },
  {
    id: "a2",
    action: "Workspace validé",
    admin: "Super Admin",
    target: "Hôtel Azur Palace",
    ip: "197.243.12.4",
    date: "2025-01-10 13:18",
    severity: "low",
  },
  {
    id: "a3",
    action: "Plan modifié",
    admin: "Modérateur #2",
    target: "Pharmacie Centrale → Business",
    ip: "41.202.219.14",
    date: "2025-01-10 11:05",
    severity: "medium",
  },
  {
    id: "a4",
    action: "Paramètres SMTP mis à jour",
    admin: "Super Admin",
    target: "Serveur mail production",
    ip: "197.243.12.4",
    date: "2025-01-09 18:44",
    severity: "medium",
  },
  {
    id: "a5",
    action: "Clé API régénérée",
    admin: "Super Admin",
    target: "API Key — Production",
    ip: "197.243.12.4",
    date: "2025-01-09 16:30",
    severity: "high",
  },
  {
    id: "a6",
    action: "Mode maintenance activé",
    admin: "Super Admin",
    target: "Plateforme entière",
    ip: "197.243.12.4",
    date: "2025-01-08 22:10",
    severity: "high",
  },
  {
    id: "a7",
    action: "Contenu supprimé",
    admin: "Modérateur #1",
    target: "Commentaire #c5 — spam",
    ip: "41.202.200.1",
    date: "2025-01-08 10:22",
    severity: "medium",
  },
];

const SUSPICIOUS = [
  {
    id: "sp1",
    type: "Tentatives de connexion répétées",
    source: "102.244.51.8",
    count: 14,
    date: "Il y a 2h",
    resolved: false,
  },
  {
    id: "sp2",
    type: "Accès API inhabituel",
    source: "41.202.100.8",
    count: 3,
    date: "Il y a 5h",
    resolved: false,
  },
  {
    id: "sp3",
    type: "Changement de mot de passe mass.",
    source: "197.243.80.1",
    count: 8,
    date: "Il y a 1j",
    resolved: true,
  },
];

const severityCfg = {
  low: {
    badge:
      "bg-slate-100 text-slate-500 dark:bg-neutral-700/50 dark:text-neutral-400",
    dot: "bg-slate-400",
  },
  medium: {
    badge:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    dot: "bg-amber-400",
  },
  high: {
    badge: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    dot: "bg-red-500",
  },
};
