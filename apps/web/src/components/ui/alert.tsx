import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "#/lib/utils";

const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-md border px-3.5 py-3 text-left text-xs has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-card text-card-foreground border-input dark:border-neutral-700",
        destructive:
          "bg-card text-destructive border-input dark:border-neutral-700 *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
        info: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/25 text-blue-700 dark:text-blue-300 *:data-[slot=alert-description]:text-blue-600/80 dark:*:data-[slot=alert-description]:text-blue-400/80 *:[svg]:text-blue-500 dark:*:[svg]:text-blue-400",
        warning:
          "bg-amber-50/50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/25 text-amber-700 dark:text-amber-300 *:data-[slot=alert-description]:text-amber-600/80 dark:*:data-[slot=alert-description]:text-amber-400/80 *:[svg]:text-amber-500 dark:*:[svg]:text-amber-400",
        success:
          "bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/25 text-emerald-700 dark:text-emerald-300 *:data-[slot=alert-description]:text-emerald-600/80 dark:*:data-[slot=alert-description]:text-emerald-400/80 *:[svg]:text-emerald-500 dark:*:[svg]:text-emerald-400",
        error:
          "bg-red-50/50 dark:bg-red-500/10 border-red-200 dark:border-red-500/25 text-red-700 dark:text-red-300 *:data-[slot=alert-description]:text-red-600/80 dark:*:data-[slot=alert-description]:text-red-400/80 *:[svg]:text-red-500 dark:*:[svg]:text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium text-sm group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-xs/relaxed text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-2",
        className,
      )}
      {...props}
    />
  );
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "absolute top-[calc(--spacing(1.25))] right-[calc(--spacing(1.25))]",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction };
