import { initials } from "#/lib/utils";
import type { User } from "@lokale/types/user";
import { AlertTriangle, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface PanelHeaderProps {
  user: User;
  editAction?: () => void;
  closeAction?: () => void;
}

export default function PanelHeader({
  user,
  editAction,
  closeAction,
}: PanelHeaderProps) {
  const hasEdit = editAction !== undefined;
  return (
    <>
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-11">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-amber-50 dark:bg-amber-500/10 text-amber-500 dark:text-amber-400 font-bold text-sm">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <span
              className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-neutral-900`}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
              {user.name}
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
              {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasEdit && (
            <button
              onClick={editAction}
              className="h-7 px-2.5 rounded-lg text-[11px] font-medium text-amber-500 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
            >
              Modifier
            </button>
          )}
          <button
            onClick={closeAction}
            className="size-7 rounded-lg flex items-center justify-center text-neutral-400 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
      <div className="px-5 pb-4 flex flex-wrap gap-1.5 shrink-0">
        <Badge variant="success">
          <span className={`size-1.5 rounded-full mr-1`} />
          Entrepreneur
        </Badge>
        <Badge variant="success">Pro</Badge>
        <Badge variant="warning">Start</Badge>
        {user.suspiciousActivity && (
          <Badge className="bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-400">
            <AlertTriangle className="size-2.5 mr-1" />
            Suspect
          </Badge>
        )}
      </div>
    </>
  );
}
