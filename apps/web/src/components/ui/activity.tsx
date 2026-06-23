import { type ReactNode } from "react";
import { cn } from "#/lib/utils";

interface ActivityProps {
  mode: "visible" | "hidden";
  children: ReactNode;
  className?: string;
}

/**
 * Affiche ou cache son contenu selon `mode`.
 * - "visible" : affiché avec une animation d'apparition
 * - "hidden"  : caché (visibility + height collapse pour éviter le layout shift)
 */
export function Activity({ mode, children, className }: ActivityProps) {
  return (
    <div
      className={cn(
        "transition-all duration-200 overflow-hidden",
        mode === "visible"
          ? "opacity-100 max-h-96 pointer-events-auto"
          : "opacity-0 max-h-0 pointer-events-none",
        className,
      )}
      aria-hidden={mode === "hidden"}
    >
      {children}
    </div>
  );
}
