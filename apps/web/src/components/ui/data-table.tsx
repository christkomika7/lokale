import { LayoutList } from "lucide-react";
import Container from "@/components/layout/container";
import { cn } from "#/lib/utils";

export interface ColumnDef<T> {
  key: string;
  label: string;
  size?: string;
  render: (row: T) => React.ReactNode;
}

export interface RowConfig<T> {
  isSelected?: (row: T) => boolean;
  onClick?: (row: T) => void;
  getKey: (row: T) => string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  rowConfig: RowConfig<T>;
  emptyLabel?: string;
  className?: string;
  isLoading?: boolean;
}

export default function DataTable<T>({
  rows,
  columns,
  rowConfig,
  emptyLabel = "Aucun résultat trouvé",
  className,
  isLoading,
}: DataTableProps<T>) {
  const gridTemplate = columns.map((c) => c.size ?? "1fr").join(" ");

  return (
    <>
      <div className="border-b border-input dark:border-neutral-800 ">
        <Container>
          <div
            className="px-6 py-2.5 grid gap-4 shrink-0"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {columns.map((col) => (
              <p
                key={col.key}
                className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-neutral-500"
              >
                {col.label}
              </p>
            ))}
          </div>
        </Container>
      </div>
      <Container className={className}>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-neutral-800/60">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-neutral-400">
              <LayoutList className="size-10 opacity-30" />
              <p className="text-sm">{emptyLabel}</p>
            </div>
          ) : (
            rows.map((row, index) => {
              const isSelected = rowConfig.isSelected?.(row) ?? false;
              const isOdd = index % 2 !== 0;

              return (
                <div
                  key={rowConfig.getKey(row)}
                  onClick={() => rowConfig.onClick?.(row)}
                  style={{ gridTemplateColumns: gridTemplate }}
                  className={cn(
                    "px-6 py-3.5 grid gap-4 items-center border-l-2 transition-colors",
                    rowConfig.onClick && "cursor-pointer",
                    isSelected
                      ? "bg-amber-50/60 dark:bg-amber-500/5 border-amber-400"
                      : isOdd
                        ? "bg-neutral-50/40 dark:bg-neutral-700/30 border-transparent hover:bg-neutral-50/70 dark:hover:bg-neutral-700/50"
                        : "bg-white dark:bg-transparent border-transparent hover:bg-neutral-50/70 dark:hover:bg-neutral-700/50",
                  )}
                >
                  {columns.map((col) => (
                    <div key={col.key} className="min-w-0">
                      {col.render(row)}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </div>
      </Container>
    </>
  );
}
