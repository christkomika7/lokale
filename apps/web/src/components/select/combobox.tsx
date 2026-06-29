import { Check, ChevronDown, X, type LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";

interface ComboboxItem {
  id: string | number;
  value: string;
  label: string;
}

interface BaseComboboxProps {
  items: ComboboxItem[];
  placeholder?: string;
  disabled?: boolean;
  icon?: LucideIcon;
  hasError?: boolean;
  onBlur?: () => void;
  className?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
}

interface SingleComboboxProps extends BaseComboboxProps {
  mode?: "single";
  value: string | null;
  onChange: (value: string | null) => void;
}

interface MultiComboboxProps extends BaseComboboxProps {
  mode: "multi";
  value: string[];
  onChange: (value: string[]) => void;
}

type ComboboxProps = SingleComboboxProps | MultiComboboxProps;

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5 text-[12px] font-medium text-amber-700 dark:text-amber-500 leading-none">
      {label}
      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 rounded-sm text-amber-600 hover:text-amber-700 dark:hover:text-amber-200 transition-colors"
      >
        <X className="size-2.5" />
      </button>
    </span>
  );
}

export function Combobox(props: ComboboxProps) {
  const {
    items,
    placeholder = "Sélectionnez…",
    disabled = false,
    icon: Icon,
    hasError = false,
    onBlur,
    className,
    searchPlaceholder = "Rechercher…",
    emptyLabel = "Aucun résultat.",
  } = props;

  const isMulti = props.mode === "multi";

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => searchRef.current?.focus(), 0);
    } else {
      setSearch("");
    }
  }, [open]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onBlur]);

  const filtered = search.trim()
    ? items.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  function isSelected(value: string) {
    if (isMulti) return (props.value as string[]).includes(value);
    return props.value === value;
  }

  function toggle(value: string) {
    if (isMulti) {
      const current = props.value as string[];
      props.onChange(
        current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value],
      );
    } else {
      const current = props.value as string | null;
      props.onChange(current === value ? null : value);
      setOpen(false);
    }
  }

  function removeTag(value: string) {
    if (!isMulti) return;
    props.onChange((props.value as string[]).filter((v) => v !== value));
  }

  function clearAll(e: React.MouseEvent) {
    e.stopPropagation();
    if (isMulti) props.onChange([]);
    else props.onChange(null);
  }

  const selectedValues = isMulti
    ? (props.value as string[])
    : props.value
      ? [props.value as string]
      : [];

  const selectedItems = selectedValues
    .map((v) => items.find((i) => i.value === v))
    .filter(Boolean) as ComboboxItem[];

  const hasClear = selectedValues.length > 0;
  const singleLabel = !isMulti && selectedItems[0]?.label;

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-invalid={hasError}
        className={cn(
          "min-h-10 h-auto w-full min-w-0 rounded-md border border-input dark:border-transparent",
          "bg-transparent px-2.5 py-1 text-xs transition-colors outline-none",
          "flex items-center gap-1.5 cursor-pointer select-none text-left",
          !hasClear && "text-muted-foreground",
          hasClear && "text-foreground",
          open &&
            "border-amber-400 ring-3 ring-amber-400/10 dark:border-amber-400",
          hasError &&
            "border-red-400 ring-3 ring-red-500/20 dark:border-destructive/50 dark:ring-destructive/40",
          disabled &&
            "pointer-events-none cursor-not-allowed bg-input/50 opacity-50 dark:bg-input/80",
          "dark:bg-input/30 dark:disabled:bg-input/80",
          Icon ? "pl-9" : "pl-2.5",
          "pr-11",
        )}
      >
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none">
            <Icon className="size-4" />
          </span>
        )}

        <span className="flex-1 min-w-0 flex flex-wrap items-center gap-1 overflow-hidden">
          {isMulti ? (
            selectedItems.length > 0 ? (
              selectedItems.map((item) => (
                <Tag
                  key={item.id}
                  label={item.label}
                  onRemove={() => removeTag(item.value)}
                />
              ))
            ) : (
              <span className="text-muted-foreground truncate">
                {placeholder}
              </span>
            )
          ) : (
            <span
              className={cn(
                "truncate",
                !singleLabel && "text-muted-foreground",
              )}
            >
              {singleLabel ?? placeholder}
            </span>
          )}
        </span>

        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasClear && (
            <span
              role="button"
              tabIndex={-1}
              onClick={clearAll}
              className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors rounded-sm p-0.5"
            >
              <X className="size-3" />
            </span>
          )}
          <ChevronDown
            className={cn(
              "size-3.5 text-neutral-400 dark:text-neutral-500 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-multiselectable={isMulti}
          className={cn(
            "absolute z-50 mt-1 w-full min-w-40",
            "rounded-md border border-input dark:border-neutral-700",
            "bg-popover dark:bg-neutral-900 shadow-lg",
            "animate-in fade-in-0 zoom-in-95 duration-100",
          )}
        >
          <div className="border-b border-input dark:border-neutral-700 px-2.5 py-1.5">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground",
                "text-foreground dark:text-neutral-100",
              )}
            />
          </div>

          <ul className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <li className="px-2.5 py-2 text-xs text-muted-foreground text-center">
                {emptyLabel}
              </li>
            ) : (
              filtered.map((item) => {
                const selected = isSelected(item.value);
                return (
                  <li
                    key={item.id}
                    role="option"
                    aria-selected={selected}
                    onClick={() => toggle(item.value)}
                    className={cn(
                      "flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs cursor-pointer",
                      "transition-colors duration-100",
                      selected
                        ? "bg-amber-400/10 text-amber-700 dark:text-amber-300"
                        : "text-foreground dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800",
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    {selected && (
                      <Check className="size-3 text-amber-500 shrink-0" />
                    )}
                  </li>
                );
              })
            )}
          </ul>

          {isMulti && selectedValues.length > 0 && (
            <div className="border-t border-input dark:border-neutral-700 px-2.5 py-1.5 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {selectedValues.length} sélectionné
                {selectedValues.length > 1 ? "s" : ""}
              </span>
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline"
              >
                Tout effacer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
