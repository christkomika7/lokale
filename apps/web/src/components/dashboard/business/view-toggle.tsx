import { LayoutGrid, List } from "lucide-react";
import { cn } from "#/lib/utils";

export type BusinessView = "table" | "grid";

interface ViewToggleProps {
  view: BusinessView;
  onChange: (view: BusinessView) => void;
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border border-input dark:border-neutral-700 rounded-md overflow-hidden shrink-0">
      <button
        onClick={() => onChange("table")}
        className={cn(
          "size-8 flex items-center justify-center transition-colors",
          view === "table"
            ? "bg-amber-400 text-white"
            : "text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800",
        )}
      >
        <List className="size-4" />
      </button>
      <button
        onClick={() => onChange("grid")}
        className={cn(
          "size-8 flex items-center justify-center transition-colors",
          view === "grid"
            ? "bg-amber-400 text-white"
            : "text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800",
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
}
