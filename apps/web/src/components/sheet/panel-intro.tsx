import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";
import { Separator } from "../ui/separator";

interface PanelIntroProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  onClose: () => void;
  iconClassName?: string;
  iconWrapperClassName?: string;
}

export default function PanelIntro({
  icon: Icon,
  title,
  subtitle,
  onClose,
  iconClassName = "text-amber-500",
  iconWrapperClassName = "bg-amber-50 dark:bg-amber-500/10",
}: PanelIntroProps) {
  return (
    <>
      <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={`size-9 rounded-sm flex items-center justify-center shrink-0 ${iconWrapperClassName}`}
          >
            <Icon className={`size-4 ${iconClassName}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100 truncate">
              {title}
            </p>
            {subtitle && (
              <p className="text-[11px] text-neutral-500 dark:text-neutral-300 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="size-7 rounded-sm flex items-center justify-center text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors shrink-0"
        >
          <X className="size-4" />
        </button>
      </div>
      <Separator className="dark:bg-neutral-800 shrink-0" />
    </>
  );
}
