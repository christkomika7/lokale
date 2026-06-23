import { cn } from "#/lib/utils";

interface EllipsisLoaderProps {
  text?: string;
  size?: number;
  color?: string;
  speed?: "slow" | "normal" | "fast";
  className?: string;
}

const speedMap = {
  slow: {
    d1: "animate-[bounce_1.2s_ease-in-out_infinite]",
    d2: "animate-[bounce_1.2s_ease-in-out_0.2s_infinite]",
    d3: "animate-[bounce_1.2s_ease-in-out_0.4s_infinite]",
  },
  normal: {
    d1: "animate-[bounce_0.8s_ease-in-out_infinite]",
    d2: "animate-[bounce_0.8s_ease-in-out_0.15s_infinite]",
    d3: "animate-[bounce_0.8s_ease-in-out_0.3s_infinite]",
  },
  fast: {
    d1: "animate-[bounce_0.5s_ease-in-out_infinite]",
    d2: "animate-[bounce_0.5s_ease-in-out_0.1s_infinite]",
    d3: "animate-[bounce_0.5s_ease-in-out_0.2s_infinite]",
  },
};

export default function EllipsisLoader({
  text,
  size = 3,
  color = "bg-current",
  speed = "normal",
  className,
}: EllipsisLoaderProps) {
  const delays = speedMap[speed];

  return (
    <div
      className={cn("flex gap-x-1", {
        "items-center": !text,
        "items-end": text,
      })}
    >
      {text && <span>{text}</span>}
      <div
        className={cn({
          "relative top-px ": text,
        })}
      >
        <span
          className={cn("inline-flex items-end gap-1", className)}
          role="status"
          aria-label="Chargement"
        >
          <span
            className={cn("rounded-[2px] shrink-0", color, delays.d1)}
            style={{ width: size, height: size }}
          />
          <span
            className={cn("rounded-[2px] shrink-0", color, delays.d2)}
            style={{ width: size, height: size }}
          />
          <span
            className={cn("rounded-[2px] shrink-0", color, delays.d3)}
            style={{ width: size, height: size }}
          />
        </span>
      </div>
    </div>
  );
}
