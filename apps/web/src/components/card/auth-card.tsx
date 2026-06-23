import { cn } from "#/lib/utils";
import { type ReactNode } from "react";

type AuthCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function AuthCard({
  title,
  description,
  children,
  className,
}: AuthCardProps) {
  return (
    <div
      className={cn(
        "bg-white/80 border border-amber-100 dark:bg-neutral-800/60 backdrop-blur-lg rounded-2xl dark:border-neutral-700 shadow-md shadow-amber-300/25 dark:shadow-none p-6",
        className,
      )}
    >
      <div className="mb-5">
        <h1 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-neutral-500 dark:text-neutral-200 mt-1.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
