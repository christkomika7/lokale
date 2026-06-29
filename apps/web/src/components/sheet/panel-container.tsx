import Panel from "#/components/sheet/panel";

export type PanelMode = "detail" | "edit" | "create";

interface PanelContainerProps<T> {
  open: boolean;
  mode: PanelMode;
  data: T | null;
  onClose: () => void;
  onModeChange: (mode: PanelMode) => void;

  detail?: (data: T, actions: PanelActions) => React.ReactNode;
  edit?: (data: T, actions: PanelActions) => React.ReactNode;
  create?: (actions: PanelActions) => React.ReactNode;
}

export interface PanelActions {
  close: () => void;
  toDetail: () => void;
  toEdit: () => void;
  toCreate: () => void;
}

export default function PanelContainer<T>({
  open,
  mode,
  data,
  onClose,
  onModeChange,
  detail,
  edit,
  create,
}: PanelContainerProps<T>) {
  const actions: PanelActions = {
    close: onClose,
    toDetail: () => onModeChange("detail"),
    toEdit: () => onModeChange("edit"),
    toCreate: () => onModeChange("create"),
  };

  return (
    <Panel open={open} closePanel={(state) => !state && onClose()}>
      {mode === "detail" && data !== null && detail?.(data, actions)}
      {mode === "edit" && data !== null && edit?.(data, actions)}
      {mode === "create" && create?.(actions)}
    </Panel>
  );
}
