import type { RowConfig } from "#/components/ui/data-table";
import DataTable from "#/components/ui/data-table";
import type { AdminUsers } from "#/types/user";
import type { Row } from "@tanstack/react-table";
import { columns } from "./user.colum";

interface UsersTableProps {
  rows: Row<AdminUsers>[];
  selectedUser: AdminUsers | null;
  openDetail: (user: AdminUsers) => void;
  closePanel: () => void;
  panelMode: "detail" | "create" | "edit";
}

export default function UsersTable({
  rows,
  selectedUser,
  openDetail,
  closePanel,
  panelMode,
}: UsersTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<AdminUsers> = {
    getKey: (user) => user.id,
    isSelected: (user) => selectedUser?.id === user.id,
    onClick: (user) => {
      const isSelected = selectedUser?.id === user.id;
      if (isSelected && panelMode === "detail") {
        closePanel();
      } else {
        openDetail(user);
      }
    },
  };

  return (
    <DataTable
      rows={data}
      columns={columns}
      rowConfig={rowConfig}
      emptyLabel="Aucun utilisateur trouvé"
    />
  );
}
