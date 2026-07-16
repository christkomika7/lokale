import { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Loader2, UserX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Role } from "@lokale/types/user";
import { SUSPEND_DURATIONS } from "@lokale/config/date";

import DialogHeader from "./components/dialog-header";
import AlertMessage from "../alert/alert-message";
import Required from "../input/required";
import Loader from "../ui/loader";

interface SuspendUserProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: Role;
  hasActiveSubscription?: boolean;
  onConfirm: (payload: {
    durationDays: number;
    reason?: string;
  }) => Promise<void> | void;
}

export function SuspendUser({
  open,
  loading,
  onOpenChange,
  userRole,
  hasActiveSubscription,
  onConfirm,
}: SuspendUserProps) {
  const [durationDays, setDurationDays] = useState(30);
  const [reason, setReason] = useState("");

  const handleOpenChange = (v: boolean) => {
    if (loading) return;
    if (!v) {
      setDurationDays(30);
      setReason("");
    }
    onOpenChange(v);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm({
        durationDays,
        reason: reason.trim() ? reason.trim() : undefined,
      });
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader
          icon={UserX}
          title="Suspendre l'utilisateur"
          description="L'utilisateur ne pourra plus se connecter tant que son compte n'est pas réactivé."
          variant="amber"
          onOpenChange={onOpenChange}
          loading={loading}
        />

        <div className="space-y-4">
          <div className="-space-y-0.5">
            <Label className="text-xs text-neutral-500">
              Durée de la suspension <Required />
            </Label>
            <Select
              value={String(
                SUSPEND_DURATIONS.find((v) => v.value === durationDays)?.label,
              )}
              onValueChange={(v) => setDurationDays(Number(v))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une durée" />
              </SelectTrigger>
              <SelectContent>
                {SUSPEND_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={String(d.value)}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1 max-w-[385px] w-full">
            <Label className="text-xs text-neutral-500">
              Motif <span className="text-neutral-400">(optionnel)</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison de la suspension..."
              className="resize-none"
              rows={3}
            />
          </div>

          {userRole === Role.WORKSPACE && hasActiveSubscription && (
            <AlertMessage
              type="warning"
              title="Abonnement mis en pause"
              description="Cet utilisateur possède un abonnement Entreprise actif."
              subtext="Son abonnement sera mis en pause pendant toute la durée de la suspension : aucune facturation ne sera émise et le temps restant sera conservé à la réactivation du compte."
            />
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => handleOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="amber"
            className="rounded-sm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader />}
            Suspendre
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
