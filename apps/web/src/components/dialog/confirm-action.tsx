import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Loader2, type LucideIcon } from "lucide-react";
import DialogHeader from "./components/dialog-header";
import Loader from "../ui/loader";

interface ConfirmActionDialogProps {
  open: boolean;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  icon: LucideIcon;
  title: string;
  description: string;
  confirmLabel: string;
  variant?: "default" | "amber" | "error" | "active";
}

export function ConfirmActionDialog({
  open,
  loading,
  onOpenChange,
  onConfirm,
  icon: Icon,
  title,
  description,
  confirmLabel,
  variant = "default",
}: ConfirmActionDialogProps) {
  const handleConfirm = async () => {
    try {
      onConfirm();
    } catch {}
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
            {loading && <Loader />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
