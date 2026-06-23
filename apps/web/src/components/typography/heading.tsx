interface HeadingProps {
  children: React.ReactNode;
  className?: string;
}

export default function Heading({
  children,
  className = "mb-3",
}: HeadingProps) {
  return (
    <p
      className={`text-[11px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-200 mb-3 ${className}`}
    >
      {children}
    </p>
  );
}
