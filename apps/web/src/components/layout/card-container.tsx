import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "#/lib/utils";

import Container from "./container";

interface CardContainerProps {
  children: React.ReactNode;
  className?: string;
}

export default function CardContainer({
  children,
  className,
}: CardContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const overflowing = el.scrollWidth > el.clientWidth + 1;
    setIsOverflowing(overflowing);
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      resizeObserver.disconnect();
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByAmount = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <Container className={className}>
      <div className="relative">
        {isOverflowing && canScrollLeft && (
          <button
            type="button"
            aria-label="Défiler vers la gauche"
            onClick={() => scrollByAmount("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 size-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xs flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            <ChevronLeft className="size-4" />
          </button>
        )}

        {isOverflowing && canScrollRight && (
          <button
            type="button"
            aria-label="Défiler vers la droite"
            onClick={() => scrollByAmount("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 size-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 shadow-xs flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
          >
            <ChevronRight className="size-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className={cn(
            "flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory",
            "scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
          )}
        >
          {React.Children.map(children, (child) => (
            <div
              className={cn(
                "snap-start shrink-0",
                "basis-[calc(50%-0.375rem)]",
                "md:basis-[calc(33.3333%-0.5rem)]",
                "lg:basis-[calc(16.6667%-0.625rem)]",
              )}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
