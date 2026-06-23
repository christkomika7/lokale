import { cn } from "#/lib/utils";
import { X, AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  className?: string;
  onDismiss: () => void;
}

export default function ErrorMessage({
  message,
  className,
  onDismiss,
}: ErrorMessageProps) {
  if (!message) return null;

  function handleDismiss() {
    onDismiss();
  }

  return (
    <div
      className={cn(
        "flex  items-center gap-3 p-3 rounded-md mb-3",
        "bg-red-50 dark:bg-red-500/10",
        "border border-red-200 dark:border-red-500/20",
        "animate-in fade-in slide-in-from-top-1 duration-200",
        className,
      )}
      role="alert"
    >
      <AlertCircle className="size-3.5 mt-px shrink-0 text-red-500 dark:text-red-400" />
      <p className="flex-1 text-[12px] leading-relaxed font-medium text-red-600 dark:text-red-400">
        {message}
      </p>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fermer"
        className={cn(
          "shrink-0 rounded-full p-0.5 transition-colors cursor-pointer",
          "text-red-400 dark:text-red-500",
          "hover:text-red-600 dark:hover:text-red-300",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400",
        )}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
