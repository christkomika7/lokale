import { cn } from "#/lib/utils";
import { Loader as Spinner } from "lucide-react";

interface LoaderProps {
  className?: string;
}

export default function Loader({ className }: LoaderProps) {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner className={cn("animate-spin size-3.5", className)} />
    </div>
  );
}
