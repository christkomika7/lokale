import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { AlertCircle, HelpCircle } from "lucide-react";

interface HelpProps {
  action: "help" | "alert";
  title?: string;
  message: React.ReactNode;
  info?: string;
}

export function Hint({ action, title, message, info }: HelpProps) {
  return (
    <HoverCard>
      <HoverCardTrigger
        delay={10}
        closeDelay={100}
        render={
          <span>
            {action === "help" ? (
              <HelpCircle className="size-4 text-neutral-500" />
            ) : (
              <AlertCircle className="size-4 text-neutral-500" />
            )}
          </span>
        }
      />
      <HoverCardContent className="flex w-64 flex-col gap-0.5">
        {title && <div className="font-semibold">{title}</div>}
        <div className="text-neutral-500 text-xs dark:text-neutral-200">
          {message}
        </div>
        {info && (
          <div className="mt-1 text-xs text-muted-foreground">{info}</div>
        )}
      </HoverCardContent>
    </HoverCard>
  );
}
