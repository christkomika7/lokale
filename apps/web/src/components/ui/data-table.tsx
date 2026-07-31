import TableLoader from "../loader/table-loader";

export interface ColumnDef<T> {
  key: string;
  label: string;
  size?: string;
  render: (row: T) => React.ReactNode;
}

export interface RowConfig<T> {
  getKey: (row: T) => string;
  isSelected?: (row: T) => boolean;
  onClick?: (row: T) => void;
}

interface DataTableProps<T> {
  rows: T[];
  columns: ColumnDef<T>[];
  rowConfig: RowConfig<T>;
  emptyLabel?: string;
  isLoading?: boolean;
  isFetching?: boolean;
  skeletonRowCount?: number;
}

export default function DataTable<T>({
  rows,
  columns,
  rowConfig,
  emptyLabel = "Aucune donnée trouvée",
  isLoading,
  isFetching,
  skeletonRowCount = 8,
}: DataTableProps<T>) {
  const gridTemplateColumns = columns.map((c) => c.size ?? "1fr").join(" ");

  const showFullSkeleton = isLoading && rows.length === 0;
  const showRefetchOverlay = isFetching && !isLoading && rows.length > 0;

  return (
    <div className="w-full">
      <div
        className="grid min-h-12  items-center px-3 py-2 border-b border-input dark:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-800/20"
        style={{ gridTemplateColumns }}
      >
        {columns.map((col) => (
          <span
            key={col.key}
            className="text-[11px] font-medium uppercase tracking-wide text-neutral-400"
          >
            {col.label}
          </span>
        ))}
      </div>

      <div className="relative divide-y divide-neutral-50 dark:divide-neutral-800/60">
        {showFullSkeleton ? (
          Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
            <div
              key={`skeleton-${rowIndex}`}
              className="grid items-center gap-3 px-3 py-3"
              style={{ gridTemplateColumns }}
            >
              {columns.map((_, colIndex) => (
                <TableLoader
                  key={colIndex}
                  rowIndex={rowIndex}
                  colIndex={colIndex}
                />
              ))}
            </div>
          ))
        ) : rows.length === 0 ? (
          <div className="py-10 text-center text-[13px] text-neutral-400">
            {emptyLabel}
          </div>
        ) : (
          <>
            {showRefetchOverlay && (
              <div
                aria-hidden
                className="absolute inset-0 z-10 bg-white/50 dark:bg-neutral-900/40 backdrop-blur-[1px] pointer-events-none transition-opacity duration-150"
              />
            )}
            {rows.map((row) => {
              const key = rowConfig.getKey(row);
              const selected = rowConfig.isSelected?.(row) ?? false;
              return (
                <div
                  key={key}
                  onClick={() => rowConfig.onClick?.(row)}
                  className={`grid items-center gap-3 px-3 py-3 cursor-pointer transition-colors hover:bg-neutral-50/60 dark:hover:bg-neutral-800/20 ${
                    selected ? "bg-amber-50/60 dark:bg-amber-500/10" : ""
                  }`}
                  style={{ gridTemplateColumns }}
                >
                  {columns.map((col) => (
                    <div key={col.key} className="min-w-0 text-[12px]">
                      {col.render(row)}
                    </div>
                  ))}
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
