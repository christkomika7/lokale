type MetricVariant =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "primary"
  | "purple"
  | "pink"
  | "mauve"
  | "cyan"
  | "orange";

interface MetricCardProps {
  label: string;
  value: string | number;
  sub?: string;
  variant?: MetricVariant;
  icon: React.ElementType;
  total?: number;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
}

const variantStyles: Record<
  MetricVariant,
  { icon: string; accent: string; ring: string }
> = {
  info: {
    icon: "text-blue-500 dark:text-blue-400",
    accent: "bg-blue-500 dark:bg-blue-400",
    ring: "border-blue-200 dark:border-blue-500/30",
  },
  success: {
    icon: "text-emerald-500 dark:text-emerald-400",
    accent: "bg-emerald-500 dark:bg-emerald-400",
    ring: "border-emerald-200 dark:border-emerald-500/30",
  },
  warning: {
    icon: "text-amber-400 dark:text-amber-400",
    accent: "bg-amber-300 dark:bg-amber-300",
    ring: "border-amber-300 dark:border-amber-400/30",
  },
  danger: {
    icon: "text-red-500 dark:text-red-400",
    accent: "bg-red-500 dark:bg-red-400",
    ring: "border-red-200 dark:border-red-500/30",
  },
  neutral: {
    icon: "text-neutral-500 dark:text-neutral-400",
    accent: "bg-neutral-400 dark:bg-neutral-500",
    ring: "border-neutral-200 dark:border-neutral-700",
  },
  primary: {
    icon: "text-indigo-500 dark:text-indigo-400",
    accent: "bg-indigo-500 dark:bg-indigo-400",
    ring: "border-indigo-200 dark:border-indigo-500/30",
  },
  purple: {
    icon: "text-violet-500 dark:text-violet-400",
    accent: "bg-violet-500 dark:bg-violet-400",
    ring: "border-violet-200 dark:border-violet-500/30",
  },
  pink: {
    icon: "text-pink-600 dark:text-pink-400",
    accent: "bg-pink-600 dark:bg-pink-400",
    ring: "border-pink-200 dark:border-pink-500/30",
  },
  mauve: {
    icon: "text-mauve-600 dark:text-mauve-400",
    accent: "bg-mauve-600 dark:bg-mauve-400",
    ring: "border-mauve-200 dark:border-mauve-500/30",
  },
  cyan: {
    icon: "text-cyan-500 dark:text-cyan-400",
    accent: "bg-cyan-500 dark:bg-cyan-400",
    ring: "border-cyan-200 dark:border-cyan-500/30",
  },
  orange: {
    icon: "text-orange-500 dark:text-orange-400",
    accent: "bg-orange-500 dark:bg-orange-400",
    ring: "border-orange-200 dark:border-orange-500/30",
  },
};

function RadialProgress({
  percentage,
  colorClass,
}: {
  percentage: number;
  colorClass: string;
}) {
  const size = 56;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        className="stroke-neutral-100 dark:stroke-neutral-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={stroke}
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className={`${colorClass} transition-[stroke-dashoffset] duration-700 ease-out`}
        stroke="currentColor"
      />
    </svg>
  );
}

export default function MetricCard({
  label,
  value,
  sub,
  variant = "neutral",
  icon: Icon,
  total = 20,
  trend = { value: 10, direction: "up" },
}: MetricCardProps) {
  const numericValue = typeof value === "number" ? value : Number(value);
  const hasTotal = typeof total === "number" && total > 0;
  const percentage = hasTotal
    ? Math.min(100, Math.round((numericValue / total) * 100))
    : 100;

  const styles = variantStyles[variant];

  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-600 dark:text-emerald-400"
      : trend?.direction === "down"
        ? "text-red-600 dark:text-red-400"
        : "text-neutral-400";

  const trendSign =
    trend?.direction === "up" ? "+" : trend?.direction === "down" ? "−" : "";

  return (
    <div className="relative min-w-[240px] flex items-center gap-4 border border-input bg-white dark:bg-neutral-900/60 dark:border-neutral-800 rounded-xl p-4 pl-5 overflow-hidden">
      {/* accent latéral : encode la catégorie de la métrique */}
      <span
        className={`absolute left-0 top-0 bottom-0 w-[4px] ${styles.accent}`}
      />

      <span
        className={`absolute top-1.5 right-1.5 size-6 rounded-full flex items-center justify-center bg-transparent border ${styles.ring} ${styles.icon}`}
      >
        <Icon className="size-3" strokeWidth={2.5} />
      </span>

      {/* anneau de progression */}
      <div className="relative shrink-0">
        <RadialProgress percentage={percentage} colorClass={styles.icon} />
        {hasTotal && (
          <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-neutral-700 dark:text-neutral-200 tabular-nums">
            {percentage}%
          </span>
        )}
      </div>

      {/* contenu */}
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-100">
          {label}
        </p>

        <div className="flex items-baseline gap-1.5 mt-1">
          <p className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight tabular-nums leading-none">
            {value}
          </p>
          {hasTotal && (
            <p className="text-xs text-neutral-400 dark:text-neutral-200 tabular-nums">
              sur {total.toLocaleString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1.5">
          {trend && (
            <span
              className={`text-[11px] font-medium tabular-nums ${trendColor}`}
            >
              {trendSign}
              {Math.abs(trend.value)}%
            </span>
          )}
          {sub && (
            <span className="text-[10px] text-neutral-400 dark:text-neutral-200 truncate">
              {sub}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
