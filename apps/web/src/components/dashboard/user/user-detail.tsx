import { planCfg, roleCfg, statusCfg } from "#/config/admin/user";
import {
  Activity,
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Crown,
  Globe,
  Key,
  LogIn,
  Mail,
  MapPin,
  Phone,
  Shield,
  Smartphone,
  Trash2,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { Separator } from "../../ui/separator";
import Heading from "../../typography/heading";
import DetailField from "../../ui/detail-field";
import { Button } from "../../ui/button";
import PanelHeader from "#/components/sheet/panel-header";
import { UserStatus, type User } from "@lokale/types/user";

interface UserDetailProps {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}

export default function UserDetail({ user, onClose, onEdit }: UserDetailProps) {
  const s = statusCfg[user.status];
  const r = roleCfg[user.role];
  const p = planCfg[user.plan];

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <PanelHeader user={user} editAction={onEdit} closeAction={onClose} />
      <Separator className="dark:bg-neutral-800 shrink-0" />

      <div className="px-5 py-4 space-y-5 flex-1">
        <div>
          <Heading>Informations</Heading>
          <div className="divide-y divide-slate-50 dark:divide-neutral-800">
            <DetailField icon={Mail} label="Email">
              <span className="flex items-center gap-1.5">
                {user.email}
                {user.emailVerified ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <XCircle className="size-3.5 text-red-400" />
                )}
              </span>
            </DetailField>
            <DetailField icon={Phone} label="Téléphone" value={user.phone} />
            <DetailField
              icon={MapPin}
              label="Ville / Pays"
              value={`${user.city}, ${user.country}`}
            />
            <DetailField
              icon={Calendar}
              label="Inscription"
              value={user.joinedAt}
            />
            <DetailField
              icon={Clock}
              label="Dernière connexion"
              value={user.lastSeen}
            />
            <DetailField
              icon={Activity}
              label="Actions totales"
              value={user.actions.toLocaleString("fr-FR")}
            />
            <DetailField icon={Shield} label="Vérif. identité">
              <span className="flex items-center gap-1.5">
                {user.idVerified ? (
                  <span className="text-emerald-500">Vérifié</span>
                ) : (
                  <span className="text-red-400">Non vérifié</span>
                )}
              </span>
            </DetailField>
          </div>
        </div>

        <Separator className="dark:bg-neutral-800" />
        <div>
          <Heading>Sécurité</Heading>
          <div className="divide-y divide-slate-50 dark:divide-neutral-800">
            <DetailField icon={Globe} label="Adresses IP">
              <div className="flex flex-col gap-0.5">
                {user.ips.map((ip) => (
                  <code key={ip} className="text-[11px] font-mono">
                    {ip}
                  </code>
                ))}
              </div>
            </DetailField>
            <DetailField icon={Smartphone} label="Appareils connectés">
              <div className="flex flex-col gap-0.5">
                {user.devices.map((d) => (
                  <span key={d} className="text-[12px]">
                    {d}
                  </span>
                ))}
              </div>
            </DetailField>
          </div>
          {user.suspiciousActivity && (
            <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20">
              <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-600 dark:text-red-400 font-medium">
                Activité suspecte détectée sur ce compte.
              </p>
            </div>
          )}
        </div>
        <Separator className="dark:bg-neutral-800" />
        <div>
          <Heading>Abonnement</Heading>
          <div className="flex flex-col gap-1">
            <Button variant="default">
              <CreditCard className="size-4 mr-2" />
              Modifier le plan
            </Button>
            <Button variant="secondary">
              <Crown className="size-4 mr-2" />
              Activer Premium
            </Button>
            <Button variant="destructive">
              <XCircle className="size-4 mr-2" />
              Annuler l'abonnement
            </Button>
          </div>
        </div>

        <Separator className="dark:bg-neutral-800" />

        {/* Gestion du compte */}
        <div>
          <Heading>Gestion du compte</Heading>
          <div className="flex flex-col gap-1">
            <Button variant="default">
              <LogIn className="size-4 mr-2" />
              Se connecter en tant que
            </Button>
            <Button variant="default">
              <Key className="size-4 mr-2" />
              Réinitialiser le mot de passe
            </Button>
            <Button variant="default">
              <Shield className="size-4 mr-2" />
              Changer le rôle
            </Button>
            {user.status === UserStatus.ACTIVE && (
              <Button variant="destructive">
                <UserX className="size-4 mr-2" />
                Suspendre l'utilisateur
              </Button>
            )}
            {user.status === UserStatus.SUSPENDED && (
              <Button variant="secondary">
                <UserCheck className="size-4 mr-2" />
                Réactiver l'utilisateur
              </Button>
            )}
            {user.status !== UserStatus.BANNED && (
              <Button variant="destructive">
                <Ban className="size-4 mr-2" />
                Bannir l'utilisateur
              </Button>
            )}
            {user.status === UserStatus.BANNED && (
              <Button variant="secondary">
                <UserCheck className="size-4 mr-2" />
                Lever le bannissement
              </Button>
            )}
            <Button variant="destructive">
              <Trash2 className="size-4 mr-2" />
              Supprimer le compte
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
