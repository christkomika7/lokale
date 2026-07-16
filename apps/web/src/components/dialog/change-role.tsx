import { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2, Shield, ShieldCog } from "lucide-react";
import { Role } from "@lokale/types/user";
import { roles } from "@lokale/config/auth/permissions";
import { Combobox } from "../select/combobox";

import DialogHeader from "./components/dialog-header";
import AlertMessage from "../alert/alert-message";
import { Badge } from "../ui/badge";
import Loader from "../ui/loader";

interface ChangeRoleDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: Role;
  onConfirm: (role: Role) => Promise<void> | void;
}

export function ChangeRoleDialog({
  open,
  loading,
  onOpenChange,
  currentRole,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<Role>(currentRole);

  const handleConfirm = async () => {
    if (role === currentRole) return;
    try {
      onConfirm(role);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader
          icon={Shield}
          title="Changer le rôle"
          description="Modifie les permissions de cet utilisateur sur la plateforme."
          variant="default"
          onOpenChange={onOpenChange}
          loading={loading}
        />

        <div className="space-y-2">
          <Label className="text-xs text-neutral-500">Nouveau rôle</Label>
          <Combobox
            items={roles}
            value={role}
            onChange={(value) => setRole(value as Role)}
            icon={ShieldCog}
            placeholder="Sélectionner un rôle"
            emptyLabel="Aucun rôle trouvé."
          />
          {currentRole === Role.WORKSPACE && role !== Role.WORKSPACE && (
            <AlertMessage
              type="warning"
              title="Abonnement annulé automatiquement"
              description="Cet utilisateur possède un abonnement actif lié à son statut d'entreprise."
              subtext="En changeant son rôle, son abonnement en cours sera annulé immédiatement et ne sera pas remboursé automatiquement."
            />
          )}

          {currentRole !== Role.WORKSPACE && role === Role.WORKSPACE && (
            <AlertMessage
              type="warning"
              title="Aucun abonnement associé"
              description="Le passage au rôle Entreprise ne crée pas d'abonnement automatiquement."
              subtext={
                <>
                  L'utilisateur restera sur le plan{" "}
                  <Badge variant="info">FREE</Badge> jusqu'à ce qu'un abonnement
                  lui soit attribué manuellement.
                </>
              }
            />
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="amber"
            className="rounded-sm"
            onClick={handleConfirm}
            disabled={loading || role === currentRole}
          >
            {loading && <Loader />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
