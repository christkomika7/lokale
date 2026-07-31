import { cityColumns } from "./city.column";

import type { RowConfig } from "#/components/ui/data-table";
import type { City } from "@lokale/types/localisation";
import type { Row } from "@tanstack/react-table";
import type { PanelMode } from "@lokale/types/panel";

import DataTable from "#/components/ui/data-table";

interface CitiesTableProps {
  rows: Row<City>[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedId: string | null;
  onOpen: (city: City) => void;
  onClose: () => void;
  panelMode: PanelMode;
}

export default function CitiesTable({
  rows,
  isLoading,
  isFetching,
  selectedId,
  onOpen,
  onClose,
  panelMode,
}: CitiesTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<City> = {
    getKey: (city) => city.id,
    isSelected: (city) => selectedId === city.id,
    onClick: (city) => {
      const isSelected = selectedId === city.id;
      if (isSelected && panelMode === "detail") {
        onClose();
      } else {
        onOpen(city);
      }
    },
  };

  return (
    <DataTable
      rows={data}
      columns={cityColumns}
      rowConfig={rowConfig}
      emptyLabel="Aucune ville trouvée"
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
}
