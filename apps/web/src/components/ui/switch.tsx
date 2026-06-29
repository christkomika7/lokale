import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-all duration-200 outline-none",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "data-[size=default]:h-[18.4px] data-[size=default]:w-[32px]",
        "data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        "focus-visible:border-amber-400 focus-visible:ring-3 focus-visible:ring-amber-400/20",
        "dark:focus-visible:border-amber-400 dark:focus-visible:ring-amber-400/15",
        "aria-invalid:border-red-400 aria-invalid:ring-3 aria-invalid:ring-red-500/20",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        "data-unchecked:bg-neutral-200 dark:data-unchecked:bg-neutral-800",
        "data-checked:bg-amber-400 dark:data-checked:bg-neutral-800",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full ring-0 transition-all duration-200",
          "group-data-[size=default]/switch:size-4",
          "group-data-[size=sm]/switch:size-3",
          "data-unchecked:bg-white dark:data-unchecked:bg-neutral-100",
          "data-checked:bg-white dark:data-checked:bg-amber-400",
          "group-data-[size=default]/switch:data-unchecked:translate-x-0",
          "group-data-[size=sm]/switch:data-unchecked:translate-x-0",
          "group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]",
          "group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)]",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
