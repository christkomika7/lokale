import { cn } from "#/lib/utils";
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn("max-w-5xl w-full mx-auto", className)}>{children}</div>
  );
}
