import { countryColumns } from "./country.column";

import type { RowConfig } from "#/components/ui/data-table";
import type { Country } from "@lokale/types/localisation";
import type { Row } from "@tanstack/react-table";
import type { PanelMode } from "@lokale/types/panel";

import DataTable from "#/components/ui/data-table";

interface CountriesTableProps {
  rows: Row<Country>[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedId: string | null;
  onOpen: (country: Country) => void;
  onClose: () => void;
  panelMode: PanelMode;
}

export default function CountriesTable({
  rows,
  isLoading,
  isFetching,
  selectedId,
  onOpen,
  onClose,
  panelMode,
}: CountriesTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<Country> = {
    getKey: (country) => country.id,
    isSelected: (country) => selectedId === country.id,
    onClick: (country) => {
      const isSelected = selectedId === country.id;
      if (isSelected && panelMode === "detail") {
        onClose();
      } else {
        onOpen(country);
      }
    },
  };

  return (
    <DataTable
      rows={data}
      columns={countryColumns}
      rowConfig={rowConfig}
      emptyLabel="Aucun pays trouvé"
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
}
