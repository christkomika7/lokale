import {
  Activity,
  AlertTriangle,
  BadgeCheck,
  Ban,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  Globe,
  Key,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  Smartphone,
  Trash2,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { Separator } from "../../ui/separator";
import { Button } from "../../ui/button";
import {
  UserStatus,
  type User,
  type Role,
  type Plan,
} from "@lokale/types/user";
import { getCity } from "#/data/city";
import { formatIp, formatPhone, parseUserAgent } from "@lokale/lib/helpers";
import { formatDate } from "@lokale/lib/date";
import { cn } from "#/lib/utils";
import { useEffect, useState } from "react";
import type { DailogType } from "@lokale/types/dialog";
import { ConfirmActionDialog } from "#/components/dialog/confirm-action";
import { SecureConfirmDialog } from "#/components/dialog/confirm-secure";
import { ChangeRoleDialog } from "#/components/dialog/change-role";
import { ChangePlanDialog } from "#/components/dialog/change-plan";
import { api } from "./lib/api";

import Heading from "../../typography/heading";
import DetailField from "../../ui/detail-field";
import PanelHeader from "#/components/sheet/panel-header";
import { usePanelDialogStore } from "#/store/panel.store";
import { SuspendUser } from "#/components/dialog/suspend-user";
import { BanUser } from "#/components/dialog/ban-user";

interface UserDetailProps {
  user: User;
  onClose: () => void;
  onEdit: () => void;
}

export default function UserDetail({ user, onClose, onEdit }: UserDetailProps) {
  const [dialog, setDialog] = useState<DailogType>(null);

  const changePlan = api.changePlan(user.id);
  const changeRole = api.changeRole(user.id);
  const cancelPlan = api.cancelPlan(user.id);
  const resetPassword = api.changePassword(user.id);
  const suspend = api.suspend(user.id);
  const ban = api.ban(user.id);
  const unban = api.unban(user.id);
  const reactivate = api.reactivate(user.id);
  const deleteUser = api.deleteUser(user.id);
  const setDialogOpen = usePanelDialogStore((s) => s.setDialogOpen);

  useEffect(() => {
    setDialogOpen(dialog !== null);
    return () => setDialogOpen(false);
  }, [dialog, setDialogOpen]);

  function closeDialog() {
    setDialog(null);
  }

  function handleDialog(state: boolean, type: DailogType) {
    setDialog(state ? type : null);
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-y-auto">
        <PanelHeader user={user} editAction={onEdit} closeAction={onClose} />
        <Separator className="dark:bg-neutral-800 shrink-0" />

        <div className="px-5 py-4 space-y-5 flex-1">
          <div>
            <Heading>Informations</Heading>
            <div className="divide-y divide-slate-50 dark:divide-neutral-800">
              <DetailField
                icon={Phone}
                label="Nom"
                value={formatPhone(user.name)}
              />
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
              <DetailField
                icon={Phone}
                label="Téléphone"
                value={formatPhone(user.phone)}
              />
              <DetailField
                icon={MapPin}
                label="Ville / Pays"
                value={`République du Congo${getCity(user.city)?.label ? `, ${getCity(user.city)?.label}` : ""}`}
              />
              <DetailField
                icon={Calendar}
                label="Inscription"
                value={formatDate(user.joinedAt, true)}
              />
              <DetailField
                icon={Clock}
                label="Dernière connexion"
                value={formatDate(user.lastSeen, true)}
              />
              <DetailField
                icon={Activity}
                label="Actions totales"
                value={user.actions.toLocaleString("fr-FR")}
              />
              <DetailField icon={Shield} label="Vérif. identité">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    user.idVerified ? "text-emerald-500" : "text-red-400",
                  )}
                >
                  {user.idVerified ? (
                    <BadgeCheck className="size-4" />
                  ) : (
                    <ShieldAlert className="size-4" />
                  )}
                  {user.idVerified ? "Vérifié" : "Non vérifié"}
                </span>
              </DetailField>
            </div>
          </div>

          <Separator className="dark:bg-neutral-800" />
          <div>
            <Heading>Sécurité</Heading>
            <div className="divide-y divide-slate-50 dark:divide-neutral-800">
              <DetailField
                icon={Globe}
                label="Adresses IP"
                value={`${
                  user.ips.length === 0
                    ? "Aucune adresse"
                    : user.ips.length === 1
                      ? "Une seule adresse"
                      : `${user.ips.length} adresses`
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  {user.ips.map((ip) => (
                    <code key={ip} className="text-[11px] font-mono">
                      {formatIp(ip)}
                    </code>
                  ))}
                </div>
              </DetailField>
              <DetailField
                icon={Smartphone}
                label="Appareils connectés"
                value={`${user.devices.length} appareil${user.devices.length > 1 ? "s" : ""}`}
              >
                <div className="flex flex-col">
                  {user.devices.map((d) => {
                    const agent = parseUserAgent(d);
                    return (
                      <div
                        key={d}
                        className="text-[11px] text-neutral-400 flex flex-col"
                      >
                        <span>
                          {agent.device} | {agent.os} | {agent.browser}
                        </span>
                      </div>
                    );
                  })}
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
              <Button
                variant="secondary"
                className="rounded-sm"
                onClick={() => setDialog("changePlan")}
              >
                <CreditCard className="size-4" />
                Modifier le plan
              </Button>
              <Button
                variant="error"
                className="rounded-sm"
                onClick={() => setDialog("cancelSubscription")}
                disabled={user.plan === "FREE"}
              >
                <XCircle className="size-4" />
                Annuler l'abonnement
              </Button>
            </div>
          </div>

          <div>
            <Heading>Gestion du compte</Heading>
            <div className="flex flex-col gap-1">
              <Button
                variant="secondary"
                className="rounded-sm"
                onClick={() => setDialog("resetPassword")}
              >
                <Key className="size-4" />
                Réinitialiser le mot de passe
              </Button>
              <Button
                variant="secondary"
                className="rounded-sm"
                onClick={() => setDialog("changeRole")}
              >
                <Shield className="size-4" />
                Changer le rôle
              </Button>
              {user.status === UserStatus.ACTIVE && (
                <Button
                  variant="amber"
                  className="rounded-sm"
                  onClick={() => setDialog("suspend")}
                >
                  <UserX className="size-4" />
                  Suspendre l'utilisateur
                </Button>
              )}
              {user.status === UserStatus.SUSPENDED && (
                <Button
                  variant="active"
                  className="rounded-sm"
                  onClick={() => setDialog("reactivate")}
                >
                  <UserCheck className="size-4" />
                  Réactiver l'utilisateur
                </Button>
              )}
              {user.status !== UserStatus.BANNED && (
                <Button
                  variant="error"
                  className="rounded-sm"
                  onClick={() => setDialog("ban")}
                >
                  <Ban className="size-4" />
                  Bannir l'utilisateur
                </Button>
              )}
              {user.status === UserStatus.BANNED && (
                <Button
                  variant="active"
                  className="rounded-sm"
                  onClick={() => setDialog("liftBan")}
                >
                  <UserCheck className="size-4" />
                  Lever le bannissement
                </Button>
              )}
              <Button
                variant="error"
                className="rounded-sm"
                onClick={() => setDialog("delete")}
              >
                <Trash2 className="size-4" />
                Supprimer le compte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmActionDialog
        open={dialog === "resetPassword"}
        onOpenChange={(v) => handleDialog(v, "resetPassword")}
        onConfirm={() =>
          resetPassword.mutate(undefined, { onSuccess: closeDialog })
        }
        loading={resetPassword.isPending}
        icon={Key}
        title="Réinitialiser le mot de passe"
        description={`Un email de réinitialisation sera envoyé à ${user.email}.`}
        confirmLabel="Envoyer le lien"
      />

      <SuspendUser
        open={dialog === "suspend"}
        onOpenChange={(v) => handleDialog(v, "suspend")}
        onConfirm={(payload) =>
          suspend.mutate(payload, { onSuccess: closeDialog })
        }
        loading={suspend.isPending}
        userRole={user.role}
        hasActiveSubscription={user.hasActiveSubscription}
      />

      <ConfirmActionDialog
        open={dialog === "reactivate"}
        onOpenChange={(v) => handleDialog(v, "reactivate")}
        onConfirm={() =>
          reactivate.mutate(undefined, { onSuccess: closeDialog })
        }
        loading={reactivate.isPending}
        icon={UserCheck}
        title="Réactiver l'utilisateur"
        description="L'utilisateur retrouvera immédiatement l'accès à son compte."
        confirmLabel="Réactiver"
        variant="active"
      />

      <ConfirmActionDialog
        open={dialog === "liftBan"}
        onOpenChange={(v) => handleDialog(v, "liftBan")}
        onConfirm={() => unban.mutate(undefined, { onSuccess: closeDialog })}
        loading={unban.isPending}
        icon={UserCheck}
        title="Lever le bannissement"
        description="L'utilisateur pourra à nouveau accéder à la plateforme."
        confirmLabel="Lever le ban"
        variant="active"
      />

      <ConfirmActionDialog
        open={dialog === "cancelSubscription"}
        onOpenChange={(v) => handleDialog(v, "cancelSubscription")}
        onConfirm={() =>
          cancelPlan.mutate(undefined, { onSuccess: closeDialog })
        }
        loading={cancelPlan.isPending}
        icon={XCircle}
        title="Annuler l'abonnement"
        description="L'abonnement actif sera annulé à la fin de la période en cours."
        confirmLabel="Annuler l'abonnement"
        variant="error"
      />

      <ChangeRoleDialog
        open={dialog === "changeRole"}
        onOpenChange={(v) => handleDialog(v, "changeRole")}
        currentRole={user.role}
        loading={changeRole.isPending}
        onConfirm={(role: Role) =>
          changeRole.mutate({ role } as any, { onSuccess: closeDialog })
        }
      />

      <ChangePlanDialog
        open={dialog === "changePlan"}
        onOpenChange={(v) => handleDialog(v, "changePlan")}
        plan={user.plan}
        role={user.role}
        loading={changePlan.isPending}
        onConfirm={(plan: Plan) =>
          changePlan.mutate({ plan } as any, {
            onSuccess: () => {
              closeDialog();
              onClose();
            },
          })
        }
      />

      {/* Actions destructives : confirmation sécurisée */}

      <BanUser
        open={dialog === "ban"}
        onOpenChange={(v) => handleDialog(v, "ban")}
        loading={ban.isPending}
        onConfirm={(payload) => ban.mutate(payload, { onSuccess: closeDialog })}
      />

      <SecureConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(v) => handleDialog(v, "delete")}
        onConfirm={() =>
          deleteUser.mutate(undefined, {
            onSuccess: () => {
              closeDialog();
              onClose();
            },
          })
        }
        loading={deleteUser.isPending}
        icon={Trash2}
        title="Supprimer le compte"
        description="Cette action est irréversible. Toutes les données de l'utilisateur (publications, paiements, sessions) seront définitivement supprimées."
        confirmLabel="Supprimer définitivement"
        confirmationValue={user.email}
      />
    </>
  );
}
