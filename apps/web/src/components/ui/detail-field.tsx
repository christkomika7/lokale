import type { LucideIcon } from "lucide-react";

interface DetailFieldProps {
  icon?: LucideIcon;
  label: string;
  value?: React.ReactNode | string;
  children?: React.ReactNode;
  layout?: "column" | "row";
  className?: string;
}

export default function DetailField({
  icon: Icon,
  label,
  value,
  children,
  layout = "column",
  className,
}: DetailFieldProps) {
  const isRow = layout === "row";

  return (
    <div
      className={`flex items-start gap-3 py-2.5 ${isRow ? "justify-between" : ""} ${className}`}
    >
      {Icon && (
        <span className="size-7 rounded-lg bg-slate-50 dark:bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="size-3.5 text-neutral-400 dark:text-neutral-500" />
        </span>
      )}

      {isRow ? (
        <div className="flex w-full justify-between items-end">
          <div className="min-w-0">
            <p className="text-[11px] text-neutral-400 dark:text-neutral-200 mb-0.5">
              {label}
            </p>
            {value && (
              <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 leading-relaxed">
                {value}
              </p>
            )}
          </div>
          {children && (
            <div className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
              {children}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-neutral-400 dark:text-neutral-200 mb-0.5">
            {label}
          </p>
          {value && (
            <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 leading-relaxed">
              {value}
            </p>
          )}
          {children && (
            <div className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200">
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
