import React, { useState } from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "#/lib/utils";
import type {
  ItemSelectProps,
  SelectProps,
  SelectPropsHeader,
} from "./lib/type";
import Loader from "../ui/loader";

interface DropdownProps {
  items?: SelectProps[];
  groups?: ItemSelectProps[];
  selected?: SelectProps;
  setSelected?: (item: SelectProps) => void;
  action: React.ReactElement;
  contentClassName?: string;
  header?: SelectPropsHeader;
}

export default function Dropdown({
  items,
  groups,
  selected,
  setSelected,
  action,
  contentClassName,
  header,
}: DropdownProps) {
  const [loadingValue, setLoadingValue] = useState<string | null>(null);

  const handleSelect = async (item: SelectProps) => {
    if (loadingValue) return; // évite les double-clics / clics concurrents

    if (item.action) {
      setLoadingValue(item.value);
      try {
        await item.action();
      } finally {
        setLoadingValue(null);
      }
    }

    setSelected?.(item);
  };

  const renderItem = (item: SelectProps) => {
    const isHighlighted = item.isActive ?? selected?.value === item.value;
    const isLoading = loadingValue === item.value;
    const isDisabled = loadingValue !== null && !isLoading;

    return (
      <DropdownMenuItem
        key={item.value}
        onClick={() => handleSelect(item)}
        disabled={isDisabled}
        className={cn(
          "rounded-[5px] text-sm cursor-pointer gap-2",
          isHighlighted &&
            "bg-amber-400/10! dark:bg-amber-600/10! text-amber-400!",
          !isHighlighted &&
            "text-neutral-700 dark:text-neutral-200 hover:text-amber-500 dark:hover:text-amber-400",
          isDisabled && "opacity-50 pointer-events-none",
          item.className,
        )}
      >
        {isLoading ? (
          <Loader className="size-4 shrink-0 animate-spin" />
        ) : (
          item.icon && (
            <span className="size-4 shrink-0 flex items-center justify-center">
              {item.icon}
            </span>
          )
        )}
        {item.label}
      </DropdownMenuItem>
    );
  };

  const resolvedGroups: ItemSelectProps[] =
    groups ?? (items ? [{ items }] : []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={action}></DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className={cn(
          "w-48 rounded-[6px] mt-1 py-1.5 space-y-1.5",
          contentClassName,
        )}
      >
        {header && (
          <>
            <div className="px-1 py-2">
              {header.name && (
                <p className="text-xs font-medium text-neutral-800 dark:text-neutral-100 truncate">
                  {header.name}
                </p>
              )}
              {header.email && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">
                  {header.email}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {resolvedGroups.map((group, i) => (
          <React.Fragment key={i}>
            {i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuGroup className="space-y-1">
              {group.label && (
                <DropdownMenuLabel className="px-1 pt-1 pb-0.5 text-xs font-medium text-neutral-400 dark:text-neutral-500">
                  {group.label}
                </DropdownMenuLabel>
              )}
              {group.items.map(renderItem)}
            </DropdownMenuGroup>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
