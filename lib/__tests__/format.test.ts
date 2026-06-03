import { describe, it, expect } from "vitest";

import { formatCurrency, formatRelativeTime, computeLevel } from "@/lib/format";

describe("formatCurrency", () => {
  it("formats zero with no cents", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("formats whole amounts without cents", () => {
    expect(formatCurrency(750)).toBe("$750");
  });

  it("formats large numbers with thousands separators", () => {
    expect(formatCurrency(1234567)).toBe("$1,234,567");
  });

  it("shows decimals when present", () => {
    // minimumFractionDigits is 0, so trailing zeros are dropped.
    expect(formatCurrency(12.5)).toBe("$12.5");
    expect(formatCurrency(99.99)).toBe("$99.99");
  });
});

describe("formatRelativeTime", () => {
  const ago = (seconds: number) => new Date(Date.now() - seconds * 1000);

  it("returns 'just now' for very recent and future dates", () => {
    expect(formatRelativeTime(ago(5))).toBe("just now");
    expect(formatRelativeTime(new Date(Date.now() + 10_000))).toBe("just now");
  });

  it("formats minutes", () => {
    expect(formatRelativeTime(ago(60))).toBe("1 minute ago");
    expect(formatRelativeTime(ago(120))).toBe("2 minutes ago");
  });

  it("formats hours", () => {
    expect(formatRelativeTime(ago(3600))).toBe("1 hour ago");
    expect(formatRelativeTime(ago(7200))).toBe("2 hours ago");
  });

  it("formats days", () => {
    expect(formatRelativeTime(ago(86_400))).toBe("1 day ago");
    expect(formatRelativeTime(ago(3 * 86_400))).toBe("3 days ago");
  });

  it("formats weeks", () => {
    expect(formatRelativeTime(ago(7 * 86_400))).toBe("1 week ago");
    expect(formatRelativeTime(ago(14 * 86_400))).toBe("2 weeks ago");
  });

  it("formats months", () => {
    expect(formatRelativeTime(ago(30 * 86_400))).toBe("1 month ago");
    expect(formatRelativeTime(ago(90 * 86_400))).toBe("3 months ago");
  });

  it("formats years", () => {
    expect(formatRelativeTime(ago(365 * 86_400))).toBe("1 year ago");
    expect(formatRelativeTime(ago(2 * 365 * 86_400))).toBe("2 years ago");
  });
});

describe("computeLevel", () => {
  it("returns 'top_rated' at the boundary", () => {
    expect(computeLevel(30, 4.8)).toBe("top_rated");
    expect(computeLevel(64, 4.95)).toBe("top_rated");
  });

  it("returns 'level2' at the boundary and just below top_rated", () => {
    expect(computeLevel(15, 4.5)).toBe("level2");
    // Enough orders for top_rated but rating too low.
    expect(computeLevel(30, 4.7)).toBe("level2");
    // High rating but not enough orders for top_rated.
    expect(computeLevel(29, 4.9)).toBe("level2");
  });

  it("returns 'level1' at the boundary", () => {
    expect(computeLevel(5, 4.0)).toBe("level1");
    expect(computeLevel(14, 4.4)).toBe("level1");
  });

  it("returns 'new' below all thresholds", () => {
    expect(computeLevel(0, 0)).toBe("new");
    expect(computeLevel(4, 5)).toBe("new"); // too few orders
    expect(computeLevel(100, 3.9)).toBe("new"); // rating below level1 cutoff
  });
});
