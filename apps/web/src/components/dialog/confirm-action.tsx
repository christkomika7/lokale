import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Loader2, type LucideIcon } from "lucide-react";
import DialogHeader from "./components/dialog-header";

interface ConfirmActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  icon: LucideIcon;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "amber" | "error" | "active";
}

export function ConfirmActionDialog({
  open,
  onOpenChange,
  onConfirm,
  icon: Icon,
  title,
  description,
  confirmLabel,
  variant = "default",
}: ConfirmActionDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <AlertDialogContent className="sm:max-w-[400px]">
        <DialogHeader
          icon={Icon}
          title={title}
          description={description}
          variant={variant}
          onOpenChange={onOpenChange}
          loading={loading}
        />

        <AlertDialogFooter className="mt-2">
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant={variant === "default" ? "outline" : variant}
            className="rounded-sm"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
