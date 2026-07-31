import { categoryColumns } from "./category.column";

import type { RowConfig } from "#/components/ui/data-table";
import type { Category } from "@lokale/types/category";
import type { Row } from "@tanstack/react-table";
import type { PanelMode } from "@lokale/types/panel";

import DataTable from "#/components/ui/data-table";

interface CategoriesTableProps {
  rows: Row<Category>[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedId: string | null;
  onOpen: (category: Category) => void;
  onClose: () => void;
  panelMode: PanelMode;
}

export default function CategoriesTable({
  rows,
  isLoading,
  isFetching,
  selectedId,
  onOpen,
  onClose,
  panelMode,
}: CategoriesTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<Category> = {
    getKey: (category) => category.id,
    isSelected: (category) => selectedId === category.id,
    onClick: (category) => {
      const isSelected = selectedId === category.id;
      if (isSelected && panelMode === "detail") {
        onClose();
      } else {
        onOpen(category);
      }
    },
  };

  return (
    <DataTable
      rows={data}
      columns={categoryColumns}
      rowConfig={rowConfig}
      emptyLabel="Aucune catégorie trouvée"
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
}
