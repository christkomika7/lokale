import { Sheet, SheetContent } from "../ui/sheet";

export default function Panel({
  open,
  closePanel,
  children,
}: {
  open: boolean;
  closePanel: (state: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={closePanel}>
      <SheetContent
        side="right"
        className="w-[340px] p-0 border-l border-input dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col [&>button]:hidden"
      >
        {children}
      </SheetContent>
    </Sheet>
  );
}
