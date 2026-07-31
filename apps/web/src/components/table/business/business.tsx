import { businessColumns } from "./business.column";
import type { RowConfig } from "#/components/ui/data-table";
import type { Business } from "@lokale/types/business";
import type { Row } from "@tanstack/react-table";
import type { PanelMode } from "@lokale/types/panel";
import DataTable from "#/components/ui/data-table";

interface BusinessesTableProps {
  rows: Row<Business>[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedId: string | null;
  onOpen: (business: Business) => void;
  onClose: () => void;
  panelMode: PanelMode;
}

export default function BusinessesTable({
  rows,
  isLoading,
  isFetching,
  selectedId,
  onOpen,
  onClose,
  panelMode,
}: BusinessesTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<Business> = {
    getKey: (b) => b.id,
    isSelected: (b) => selectedId === b.id,
    onClick: (b) => {
      const isSelected = selectedId === b.id;
      if (isSelected && panelMode === "detail") onClose();
      else onOpen(b);
    },
  };

  return (
    <DataTable
      rows={data}
      columns={businessColumns}
      rowConfig={rowConfig}
      emptyLabel="Aucune entreprise trouvée"
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
}
