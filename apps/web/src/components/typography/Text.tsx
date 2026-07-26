import { cn } from "#/lib/utils";

interface TextProps {
  children: React.ReactNode;
  size?: "xxs" | "xs" | "sm" | "md" | "xl" | "2xl";
  font?: "normal" | "semi-bold" | "bold";
  className?: string;
}

export default function Text({
  children,
  size = "sm",
  font = "normal",
  className,
}: TextProps) {
  return (
    <p
      className={cn(
        `tracking-widest text-neutral-400 dark:text-neutral-200`,
        className,
        {
          "text-[11px]": size === "xxs",
          "text-xs": size === "xs",
          "text-sm": size === "sm",
          "text-md": size === "md",
          "text-xl": size === "xl",
          "text-2xl": size === "2xl",
        },
        {
          "font-normal": font === "normal",
          "font-semibold": font === "semi-bold",
          "font-bold": font === "bold",
        },
      )}
    >
      {children}
    </p>
  );
}
