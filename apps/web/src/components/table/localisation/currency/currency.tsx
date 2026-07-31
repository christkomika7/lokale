import { currencyColumns } from "./currency.column";

import type { RowConfig } from "#/components/ui/data-table";
import type { Currency } from "@lokale/types/localisation";
import type { Row } from "@tanstack/react-table";
import type { PanelMode } from "@lokale/types/panel";

import DataTable from "#/components/ui/data-table";

interface CurrenciesTableProps {
  rows: Row<Currency>[];
  isLoading: boolean;
  isFetching?: boolean;
  selectedId: string | null;
  onOpen: (currency: Currency) => void;
  onClose: () => void;
  panelMode: PanelMode;
}

export default function CurrenciesTable({
  rows,
  isLoading,
  isFetching,
  selectedId,
  onOpen,
  onClose,
  panelMode,
}: CurrenciesTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<Currency> = {
    getKey: (currency) => currency.id,
    isSelected: (currency) => selectedId === currency.id,
    onClick: (currency) => {
      const isSelected = selectedId === currency.id;
      if (isSelected && panelMode === "detail") {
        onClose();
      } else {
        onOpen(currency);
      }
    },
  };

  return (
    <DataTable
      rows={data}
      columns={currencyColumns}
      rowConfig={rowConfig}
      emptyLabel="Aucune devise trouvée"
      isLoading={isLoading}
      isFetching={isFetching}
    />
  );
}
