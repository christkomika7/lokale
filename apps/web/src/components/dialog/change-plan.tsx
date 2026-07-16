import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Loader2, CreditCard, BadgeDollarSign } from "lucide-react";
import { Combobox } from "../select/combobox";
import { Plan, Role } from "@lokale/types/user";
import { getPlans } from "@lokale/config/auth/permissions";
import { Hint } from "../alert/help";
import AlertMessage from "../alert/alert-message";
import DialogHeader from "./components/dialog-header";
import Loader from "../ui/loader";

interface ChangePlanDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  plan: Plan;
  role: Role;
  onConfirm: (plan: Plan) => void;
}

export function ChangePlanDialog({
  open,
  loading,
  onOpenChange,
  plan,
  role,
  onConfirm,
}: ChangePlanDialogProps) {
  const [currentPlan, setCurrentPlan] = useState(plan);

  const handleConfirm = async () => {
    if (currentPlan === plan) return;
    try {
      onConfirm(currentPlan);
    } catch {}
  };

  const risk = useMemo(() => {
    if (currentPlan === plan) return null;

    const goingToFree = currentPlan === Plan.FREE && plan !== Plan.FREE;
    const goingFromFree = plan === Plan.FREE && currentPlan !== Plan.FREE;

    if (goingFromFree) {
      return {
        type: "warning" as const,
        title: "Rétrogradation vers le plan Gratuit",
        description:
          "L'abonnement actuellement actif sera annulé immédiatement et ne sera pas remboursé automatiquement.",
        subtext:
          role === Role.WORKSPACE
            ? "Le rôle de cet utilisateur repassera également en Utilisateur standard."
            : undefined,
      };
    }

    return {
      type: "warning" as const,
      title: "Changement d'abonnement",
      description:
        "Tout abonnement actif en cours sera annulé et remplacé par le nouveau plan, effectif immédiatement.",
      subtext:
        goingToFree && role !== Role.WORKSPACE
          ? "Le rôle de cet utilisateur passera automatiquement en Entreprise pour pouvoir bénéficier de ce plan."
          : undefined,
    };
  }, [currentPlan, plan, role]);

  return (
    <Dialog
      open={open}
      onOpenChangeComplete={(v) => !loading && onOpenChange(v)}
    >
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader
          icon={CreditCard}
          title="Modifier le plan"
          description="Change l'abonnement actif de cet utilisateur."
          variant="default"
          onOpenChange={onOpenChange}
          loading={loading}
        />

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

        {risk && (
          <AlertMessage
            type={risk.type}
            title={risk.title}
            description={risk.description}
            subtext={risk.subtext}
          />
        )}

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
            {loading && <Loader />}
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
