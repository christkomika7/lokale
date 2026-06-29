import type { RowConfig } from "#/components/ui/data-table";
import DataTable from "#/components/ui/data-table";
import type { User } from "@lokale/types/user";
import type { Row } from "@tanstack/react-table";
import { columns } from "./user.colum";

interface UsersTableProps {
  isLoading: boolean;
  rows: Row<User>[];
  selectedUser: User | null;
  openDetail: (user: User) => void;
  closePanel: () => void;
  panelMode: "detail" | "create" | "edit";
}

export default function UsersTable({
  rows,
  selectedUser,
  openDetail,
  closePanel,
  panelMode,
  isLoading,
}: UsersTableProps) {
  const data = rows.map((row) => row.original);

  const rowConfig: RowConfig<User> = {
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
      isLoading={isLoading}
    />
  );
}
