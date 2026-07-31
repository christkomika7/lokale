import { ChevronRight } from "lucide-react";
import type { ColumnDef } from "#/components/ui/data-table";
import type { SubCategory } from "@lokale/types/category";

export const subCategoryColumns: ColumnDef<SubCategory>[] = [
  {
    key: "subCategory",
    label: "Sous-catégorie",
    size: "2fr",
    render: (sc) => (
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
          {sc.name}
        </p>
        <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
          {sc.slug}
        </p>
      </div>
    ),
  },
  {
    key: "category",
    label: "Catégorie",
    size: "1.5fr",
    render: (sc) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400">
        {sc.category.name}
      </span>
    ),
  },
  {
    key: "description",
    label: "Description",
    size: "2fr",
    render: (sc) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate">
        {sc.description || "—"}
      </span>
    ),
  },
  {
    key: "action",
    label: "Action",
    size: "0.5fr",
    render: () => (
      <span className="flex items-center gap-1 text-[12px] text-neutral-500 dark:text-neutral-400">
        <ChevronRight className="size-3" />
      </span>
    ),
  },
];
