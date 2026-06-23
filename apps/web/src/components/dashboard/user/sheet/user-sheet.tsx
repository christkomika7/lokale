import Panel from "#/components/sheet/panel";
import type { AdminUsers, UserFormData } from "#/types/user";
import UserDetail from "./user-detail";
import UserForm from "./user-form";

interface UserSheetProps {
  open: boolean;
  panelMode: "detail" | "edit" | "create";
  selectedUser: AdminUsers | null;
  openEdit: () => void;
  closePanel: () => void;
  handleSave: (data: UserFormData) => void;
  setPanelMode: (mode: "detail" | "edit" | "create") => void;
}

export default function UserSheet({
  open,
  panelMode,
  selectedUser,
  openEdit,
  closePanel,
  handleSave,
  setPanelMode,
}: UserSheetProps) {
  return (
    <Panel open={open} closePanel={(state) => !state && closePanel()}>
      {panelMode === "detail" && selectedUser && (
        <UserDetail
          user={selectedUser}
          onClose={closePanel}
          onEdit={openEdit}
        />
      )}
      {panelMode === "edit" && selectedUser && (
        <UserForm
          mode="edit"
          user={selectedUser}
          onClose={() => setPanelMode("detail")}
          onSave={handleSave}
        />
      )}
      {panelMode === "create" && (
        <UserForm mode="create" onClose={closePanel} onSave={handleSave} />
      )}
    </Panel>
  );
}
