"use client";

import { Star, StarHalf } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Rating value, 0–5. */
  value: number;
  /** Optional review count rendered as "(count)". */
  count?: number;
  /** Star size in tailwind size units. */
  size?: "sm" | "default" | "lg";
  /** Show the numeric value next to the stars. */
  showValue?: boolean;
  /** Interactive mode (WO-12): clickable stars that call onChange. */
  interactive?: boolean;
  onChange?: (value: number) => void;
  className?: string;
}

const STAR_SIZES: Record<NonNullable<StarRatingProps["size"]>, string> = {
  sm: "size-3.5",
  default: "size-4",
  lg: "size-5",
};

/**
 * StarRating — display component for 1–5 star ratings.
 * Renders filled / half / empty stars. Optionally interactive (WO-12).
 */
export function StarRating({
  value,
  count,
  size = "default",
  showValue = false,
  interactive = false,
  onChange,
  className,
}: StarRatingProps) {
  const sizeClass = STAR_SIZES[size];
  const clamped = Math.max(0, Math.min(5, value));

  if (interactive) {
    return (
      <div className={cn("inline-flex items-center gap-1", className)}>
        <div className="inline-flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            const active = starValue <= Math.round(clamped);
            return (
              <button
                key={starValue}
                type="button"
                aria-label={`Rate ${starValue} star${starValue === 1 ? "" : "s"}`}
                onClick={() => onChange?.(starValue)}
                className="rounded-sm outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Star
                  className={cn(
                    sizeClass,
                    active
                      ? "fill-primary text-primary"
                      : "fill-transparent text-muted-foreground",
                  )}
                />
              </button>
            );
          })}
        </div>
        {showValue && (
          <span className="text-sm font-medium text-foreground">
            {clamped.toFixed(1)}
          </span>
        )}
        {typeof count === "number" && (
          <span className="text-sm text-muted-foreground">({count})</span>
        )}
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="inline-flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = clamped >= i + 1;
          const half = !filled && clamped >= i + 0.5;
          if (half) {
            return (
              <StarHalf
                key={i}
                className={cn(sizeClass, "fill-primary text-primary")}
              />
            );
          }
          return (
            <Star
              key={i}
              className={cn(
                sizeClass,
                filled
                  ? "fill-primary text-primary"
                  : "fill-transparent text-muted-foreground",
              )}
            />
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-foreground">
          {clamped.toFixed(1)}
        </span>
      )}
      {typeof count === "number" && (
        <span className="text-sm text-muted-foreground">({count})</span>
      )}
    </div>
  );
}
