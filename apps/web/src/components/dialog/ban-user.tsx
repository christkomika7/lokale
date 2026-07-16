import { useState } from "react";
import { Dialog, DialogContent, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Loader2, Ban } from "lucide-react";

import DialogHeader from "./components/dialog-header";
import AlertMessage from "../alert/alert-message";
import Loader from "../ui/loader";

interface BanUserProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (payload: { reason?: string }) => Promise<void> | void;
}

export function BanUser({
  open,
  loading,
  onOpenChange,
  onConfirm,
}: BanUserProps) {
  const [reason, setReason] = useState("");

  const handleOpenChange = (v: boolean) => {
    if (loading) return;
    if (!v) setReason("");
    onOpenChange(v);
  };

  const handleConfirm = async () => {
    try {
      await onConfirm({
        reason: reason.trim() ? reason.trim() : undefined,
      });
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader
          icon={Ban}
          title="Bannir l'utilisateur"
          description="L'utilisateur perdra définitivement l'accès à son compte."
          variant="error"
          onOpenChange={onOpenChange}
          loading={loading}
        />

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs text-neutral-500">
              Motif <span className="text-neutral-400">(optionnel)</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Raison du bannissement..."
              className="resize-none"
              rows={3}
            />
          </div>

          <AlertMessage
            type="error"
            title="Action difficilement réversible"
            description="Ce bannissement est permanent et n'a pas de date d'expiration."
            subtext="Il pourra être levé manuellement plus tard via l'action « Lever le bannissement »."
          />
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
            variant="error"
            className="rounded-sm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader />}
            Bannir définitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
