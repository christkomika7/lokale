import {
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { cn } from "#/lib/utils";
import { Button } from "../ui/button";

interface AlertMessageProps {
  title: string;
  description?: string;
  subtext?: React.ReactNode | string;
  className?: string;
  type: "default" | "destructive" | "warning" | "error" | "info" | "success";
  command?: {
    title: string;
    action: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  };
}

const iconMap: Record<AlertMessageProps["type"], React.ReactNode> = {
  default: <AlertCircle className="size-[15px] mt-1" />,
  destructive: <Trash2 className="size-[15px] mt-1" />,
  warning: <AlertTriangle className="size-[15px] mt-1" />,
  error: <AlertCircle className="size-[15px] mt-1" />,
  info: <Info className="size-[15px] mt-1" />,
  success: <CheckCircle2 className="size-[15px] mt-1" />,
};

export default function AlertMessage({
  title,
  description,
  subtext,
  className,
  type,
  command,
}: AlertMessageProps) {
  return (
    <Alert variant={type} className={cn(className)}>
      <div className="flex gap-x-2 items-end">
        <span
          className={cn("flex items-start h-full", {
            "text-red-400": type === "error" || type === "destructive",
            "text-amber-400": type === "warning",
            "text-blue-400": type === "info",
            "text-emerald-400": type === "success",
            "text-neutral-400": type === "default",
          })}
        >
          {iconMap[type]}
        </span>
        <div>
          <AlertTitle className="dark:text-white! text-neutral-800!">
            {title}
          </AlertTitle>
          {description && (
            <AlertDescription className="dark:text-neutral-200! text-neutral-500!">
              {description}
              <p className="dark:text-neutral-100! text-neutral-400!">
                {subtext}
              </p>
            </AlertDescription>
          )}
        </div>
        {command && (
          <div className="flex-1 flex justify-end">
            <Button
              variant={
                type === "error" || type === "destructive"
                  ? "error"
                  : type === "warning"
                    ? "amber"
                    : type === "info"
                      ? "info"
                      : type === "success"
                        ? "success"
                        : "default"
              }
              className="rounded-md h-8!"
              onClick={command.action}
            >
              {command.title}
            </Button>
          </div>
        )}
      </div>
    </Alert>
  );
}
