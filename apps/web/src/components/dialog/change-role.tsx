import { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2, Shield, ShieldCog } from "lucide-react";
import { Role } from "@lokale/types/user";
import { roles } from "@lokale/config/auth/permissions";
import { Combobox } from "../select/combobox";

import DialogHeader from "./components/dialog-header";

interface ChangeRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRole: Role;
  onConfirm: (role: Role) => Promise<void> | void;
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  currentRole,
  onConfirm,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (role === currentRole) return;
    setLoading(true);
    try {
      await onConfirm(role);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
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
            {loading && <Loader2 className="size-4 animate-spin" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
