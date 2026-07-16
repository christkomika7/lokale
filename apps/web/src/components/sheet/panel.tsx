import { Sheet, SheetContent } from "../ui/sheet";
import { cn } from "#/lib/utils";
import { usePanelDialogStore } from "#/store/panel.store";

export default function Panel({
  open,
  closePanel,
  children,
}: {
  open: boolean;
  closePanel: (state: boolean) => void;
  children: React.ReactNode;
}) {
  const isDialogOpen = usePanelDialogStore((s) => s.isDialogOpen);

  return (
    <Sheet open={open} onOpenChange={closePanel}>
      <SheetContent
        side="right"
        overlayClassName={cn(
          "transition-opacity duration-150",
          isDialogOpen && "opacity-0 pointer-events-none",
        )}
        className={cn(
          "w-[340px] p-0 border-l border-input dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col [&>button]:hidden transition-all duration-200",
          isDialogOpen && "opacity-0 pointer-events-none translate-x-2",
        )}
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
