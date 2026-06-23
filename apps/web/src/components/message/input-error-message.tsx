import { cn } from "#/lib/utils";

interface InputErrorMessageProps {
  message?: string;
}

interface InputErrorContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function InputErrorContainer({
  children,
  className,
}: InputErrorContainerProps) {
  return (
    <div className={cn("flex flex-col -gap-y-2", className)}>{children}</div>
  );
}

export function InputErrorMessage({
  message = "Champ invalide",
}: InputErrorMessageProps) {
  return <p className="text-destructive text-xs">{message}</p>;
}
