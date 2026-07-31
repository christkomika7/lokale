import { subCategoryColumns } from "./sub-category.column";

import type { RowConfig } from "#/components/ui/data-table";
import type { SubCategory } from "@lokale/types/category";
import type { Row } from "@tanstack/react-table";
import type { PanelMode } from "@lokale/types/panel";

import DataTable from "#/components/ui/data-table";

interface SubCategoriesTableProps {
  rows: Row<SubCategory>[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedId: string | null;
  onOpen: (subCategory: SubCategory) => void;
  onClose: () => void;
  panelMode: PanelMode;
}

export default function SubCategoriesTable({
  rows,
  isLoading,
  isFetching,
  selectedId,
  onOpen,
  onClose,
  panelMode,
}: SubCategoriesTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<SubCategory> = {
    getKey: (sc) => sc.id,
    isSelected: (sc) => selectedId === sc.id,
    onClick: (sc) => {
      const isSelected = selectedId === sc.id;
      if (isSelected && panelMode === "detail") {
        onClose();
      } else {
        onOpen(sc);
      }
    },
  };

  return (
    <DataTable
      rows={data}
      columns={subCategoryColumns}
      rowConfig={rowConfig}
      emptyLabel="Aucune sous-catégorie trouvée"
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
}
