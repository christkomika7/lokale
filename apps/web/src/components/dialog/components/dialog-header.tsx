import {
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { cn } from "#/lib/utils";
import { X, type LucideIcon } from "lucide-react";

const iconStyles = {
  default:
    "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  error: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  active:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
};

interface DialogHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  variant?: "default" | "amber" | "error" | "active";
}

export default function DialogHeader({
  icon: Icon,
  title,
  description,
  onOpenChange,
  loading,
  variant = "default",
}: DialogHeaderProps) {
  return (
    <div className="w-full h-full flex flex-col">
      <button
        type="button"
        onClick={() => !loading && onOpenChange(false)}
        disabled={loading}
        className={cn(
          "absolute right-4 top-4 cursor-pointer flex size-6 rounded-[4px] items-center justify-center text-neutral-400 transition-colors",
          "hover:bg-neutral-100 hover:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-300",
          "disabled:pointer-events-none disabled:opacity-40",
        )}
      >
        <X className="size-3.5" />
        <span className="sr-only">Fermer</span>
      </button>
      <AlertDialogHeader className="flex flex-col items-start gap-3">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full",
            iconStyles[variant],
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="space-y-1">
          <AlertDialogTitle className="text-left">{title}</AlertDialogTitle>
          <AlertDialogDescription
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>
      </AlertDialogHeader>
    </div>
  );
}
