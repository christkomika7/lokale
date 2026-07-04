// components/dialogs/change-plan-dialog.tsx
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2, CreditCard, BadgeDollarSign } from "lucide-react";
import { Combobox } from "../select/combobox";
import { Plan, Role } from "@lokale/types/user";
import { getPlans } from "@lokale/config/auth/permissions";
import { Hint } from "../alert/help";

interface ChangePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  role: Role;
  onConfirm: (plan: Plan) => Promise<void> | void;
}

export function ChangePlanDialog({
  open,
  onOpenChange,
  plan,
  role,
  onConfirm,
}: ChangePlanDialogProps) {
  const [currentPlan, setCurrentPlan] = useState(plan);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (currentPlan === plan) return;
    setLoading(true);
    try {
      await onConfirm(currentPlan);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="flex flex-col items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
            <CreditCard className="size-5" />
          </div>
          <div className="space-y-1">
            <DialogTitle>Modifier le plan</DialogTitle>
            <DialogDescription>
              Change l'abonnement actif de cet utilisateur.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex justify-between items-center w-full">
            <Label className="text-xs text-neutral-500">Plan</Label>
            <Hint
              action="help"
              title="Disponibilité des plans"
              message="Chaque rôle donne accès à un ensemble de plans spécifique. Si le plan souhaité n'apparaît pas, sélectionnez un autre rôle pour afficher les options correspondantes."
            />
          </div>
          <Combobox
            items={
              role !== Role.WORKSPACE
                ? getPlans([Plan.FREE])
                : getPlans([Plan.STARTER, Plan.PRO, Plan.BUSINESS])
            }
            value={currentPlan as unknown as string}
            onChange={(value) => setCurrentPlan(value as unknown as Plan)}
            icon={BadgeDollarSign}
            placeholder="Sélectionner un plan"
            emptyLabel="Aucun plan trouvé."
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
            disabled={loading || plan === currentPlan}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
