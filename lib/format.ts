// Pure display utilities. No React, no Zustand, no I/O.

import type { LevelTier } from "@/lib/types";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Format a dollar amount as USD. Whole amounts omit cents; decimals show. */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;
const YEAR = DAY * 365;

const plural = (value: number, unit: string): string =>
  `${value} ${unit}${value === 1 ? "" : "s"} ago`;

/** Human-readable relative time, e.g. "2 hours ago", "3 days ago". */
export function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 0) return "just now";
  if (seconds < MINUTE) return "just now";
  if (seconds < HOUR) return plural(Math.floor(seconds / MINUTE), "minute");
  if (seconds < DAY) return plural(Math.floor(seconds / HOUR), "hour");
  if (seconds < WEEK) return plural(Math.floor(seconds / DAY), "day");
  if (seconds < MONTH) return plural(Math.floor(seconds / WEEK), "week");
  if (seconds < YEAR) return plural(Math.floor(seconds / MONTH), "month");
  return plural(Math.floor(seconds / YEAR), "year");
}

/**
 * Threshold-based seller level. Higher tiers require both more completed orders
 * and a stronger average rating.
 */
export function computeLevel(
  completedOrderCount: number,
  ratingAvg: number,
): LevelTier {
  if (completedOrderCount >= 30 && ratingAvg >= 4.8) return "top_rated";
  if (completedOrderCount >= 15 && ratingAvg >= 4.5) return "level2";
  if (completedOrderCount >= 5 && ratingAvg >= 4.0) return "level1";
  return "new";
}

/** Display label for a level tier. */
export function levelLabel(tier: LevelTier): string {
  switch (tier) {
    case "top_rated":
      return "Top Rated";
    case "level2":
      return "Level 2";
    case "level1":
      return "Level 1";
    default:
      return "New";
  }
}
