import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, type LucideIcon } from "lucide-react";
import DialogHeader from "./components/dialog-header";

interface SecureConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  icon: LucideIcon;
  title: string;
  description: string;
  confirmLabel: string;
  confirmationValue: string;
  confirmationLabel?: string;
}

export function SecureConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  icon: Icon,
  title,
  description,
  confirmLabel,
  confirmationValue,
  confirmationLabel = "Confirmez la valeur",
}: SecureConfirmDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const isMatch = inputValue.trim() === confirmationValue;

  const reset = () => {
    setInputValue("");
    setLoading(false);
  };

  const handleConfirm = async () => {
    if (!isMatch) return;
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
      reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          onOpenChange(v);
          if (!v) reset();
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-[420px]">
        <DialogHeader
          icon={Icon}
          title={title}
          description={description}
          onOpenChange={onOpenChange}
          loading={loading}
          variant="error"
        />
        <div className="space-y-2 mt-1">
          <Label
            htmlFor="confirm-input"
            className="text-xs text-neutral-300 flex items-center"
          >
            <span className="font-normal">
              {confirmationLabel} :{" "}
              <span className="font-semibold text-neutral-900 dark:text-neutral-200">
                {confirmationValue}
              </span>
            </span>
          </Label>
          <Input
            id="confirm-input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={confirmationValue}
            autoComplete="off"
            className="rounded-sm font-mono"
            disabled={loading}
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="secondary"
            className="rounded-sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="error"
            className="rounded-sm"
            onClick={handleConfirm}
            disabled={!isMatch || loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            {confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
