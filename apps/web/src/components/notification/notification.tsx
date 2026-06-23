import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { StatusIndicator } from "../badge/status-indicator";

export default function Notifications() {
  return (
    <Button
      variant="icon"
      size="icon"
      className="w-10 rounded-full group relative"
    >
      <StatusIndicator className="bg-amber-400 dark:border-neutral-700/30 dark:ring-neutral-700/30 dark:hover:ring-neutral-700/30 ring-1 ring-input group-hover:ring-amber-400 border border-white group-hover:border-amber-50 absolute top-px right-0 w-2.5 h-2.5 rounded-full p-px" />
      <Bell className="size-3.5 group-hover:text-amber-400 dark:text-neutral-200 dark:group-hover:text-amber-400 transition-colors" />
    </Button>
  );
}
