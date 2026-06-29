import { XIcon } from "lucide-react";

interface EmptyDataProps {
  length?: number;
  size?: number;
}

export default function EmptyData({ length = 8, size = 12 }: EmptyDataProps) {
  return (
    <span className="flex items-center w-fit">
      {Array.from({ length }).map((_, i) => (
        <XIcon key={i} size={size} className="text-muted-foreground" />
      ))}
    </span>
  );
}
