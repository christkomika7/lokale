import { cn } from "#/lib/utils";

interface RequiredProps {
  type?: "required" | "optional";
  className?: string;
}

export default function Required({
  type = "required",
  className,
}: RequiredProps) {
  return (
    <span
      className={cn(
        "text-lg relative right-[5px]",
        type === "required"
          ? "text-red-500"
          : "text-neutral-500 dark:text-neutral-400 font-medium text-xs",
        className,
      )}
    >
      {type === "required" ? "*" : "(Optionnel)"}
    </span>
  );
}
