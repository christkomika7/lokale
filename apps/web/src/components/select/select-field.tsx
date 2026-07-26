import { cn } from "@/lib/utils";
import type { LucideProps } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";

export interface SelectFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectFieldProps {
  value?: string;
  onValueChange?: (value: string | null) => void;
  options: SelectFieldOption[];
  placeholder?: string;
  emptyMessage?: string;
  hasError?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  id?: string;
  name?: string;
  icon?: React.ForwardRefExoticComponent<
    Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
  iconPosition?: "left" | "right";
  iconClassName?: string;
}

export default function SelectField({
  value,
  onValueChange,
  options,
  placeholder = "—",
  emptyMessage = "Aucune option disponible",
  hasError = false,
  disabled,
  className,
  contentClassName,
  id,
  name,
  icon: Icon,
  iconPosition = "left",
  iconClassName,
}: SelectFieldProps) {
  const isEmpty = options.length === 0;

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled || isEmpty}
      name={name}
    >
      <div className="relative">
        {Icon && (
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground dark:text-neutral-500",
              iconPosition === "left" ? "left-3" : "right-8",
            )}
          >
            <Icon className={cn("size-4", iconClassName)} />
          </div>
        )}
        <SelectTrigger
          id={id}
          aria-invalid={hasError}
          className={cn(
            "h-10 w-full min-w-0 rounded-md border border-input dark:border-transparent dark:focus-visible:border-amber-400 bg-transparent px-2.5 py-1 text-xs transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-amber-400 focus-visible:ring-3 focus-visible:ring-amber-400/10 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-500/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            Icon && iconPosition === "left" && "pl-9",
            Icon && iconPosition === "right" && "pr-9",
            className,
          )}
        >
          <SelectValue placeholder={isEmpty ? emptyMessage : placeholder}>
            {(val: string) =>
              options.find((opt) => opt.value === val)?.label ?? val
            }
          </SelectValue>
        </SelectTrigger>
      </div>
      {!isEmpty && (
        <SelectContent className={cn("rounded-md", contentClassName)}>
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              disabled={opt.disabled}
              className="text-xs"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      )}
    </Select>
  );
}
