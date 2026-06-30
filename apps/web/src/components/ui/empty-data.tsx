import { XIcon } from "lucide-react";

interface EmptyDataProps {
  length?: number;
  size?: number;
  className?: string;
}

export default function EmptyData({
  length = 8,
  size = 12,
  className,
}: EmptyDataProps) {
  return (
    <span className={`flex items-center w-fit ${className}`}>
      {Array.from({ length }).map((_, i) => (
        <XIcon key={i} size={size} className="text-muted-foreground" />
      ))}
    </span>
  );
}
