import { Badge } from "#/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { ColumnDef } from "#/components/ui/data-table";
import type { Category } from "@lokale/types/category";

export const categoryColumns: ColumnDef<Category>[] = [
  {
    key: "category",
    label: "Catégorie",
    size: "2fr",
    render: (category) => (
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 shrink-0">
          {category.color && (
            <span
              className="size-2.5 rounded-full shrink-0"
              style={{ background: category.color }}
            />
          )}
          {category.icon && (
            <span className="text-base leading-none">{category.icon}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-neutral-700 dark:text-neutral-200 truncate">
            {category.name}
          </p>
          <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
            {category.slug}
          </p>
        </div>
      </div>
    ),
  },
  {
    key: "description",
    label: "Description",
    size: "2fr",
    render: (category) => (
      <span className="text-[12px] text-neutral-500 dark:text-neutral-400 truncate">
        {category.description || "—"}
      </span>
    ),
  },
  {
    key: "subCategories",
    label: "Sous-cat.",
    size: "1fr",
    render: (category) => (
      <Badge variant="info">
        {category._count?.subCategories ?? category.subCategories.length}
      </Badge>
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
