"use client";

import { useMemo } from "react";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatCurrency } from "@/lib/format";

/** A single revenue point: a date label plus the revenue value on that date. */
export interface RevenuePoint {
  /** Display label for the X axis (e.g. a date string). */
  label: string;
  /** Sortable ISO timestamp used to order points. */
  t: number;
  revenue: number;
}

/** A single rating point: a date label plus the rating value (0–5). */
export interface RatingPoint {
  label: string;
  t: number;
  rating: number;
}

interface TrendChartProps {
  revenueData: RevenuePoint[];
  ratingData: RatingPoint[];
}

interface MergedPoint {
  label: string;
  t: number;
  revenue?: number;
  rating?: number;
}

const REVENUE_COLOR = "var(--chart-1)";
const RATING_COLOR = "var(--chart-2)";
const AXIS_COLOR = "var(--muted-foreground)";
const GRID_COLOR = "var(--border)";

function EmptyTrendState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <LineChartIcon className="size-7 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="font-heading text-base font-medium text-foreground">
          Not enough data yet to chart a trend
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Complete more orders and collect reviews to see your revenue and
          rating trend over time.
        </p>
      </div>
    </div>
  );
}

/**
 * Display-only dual-series trend chart. Plots revenue (left axis) and rating
 * (right axis, 0–5) over time from pre-computed time-series arrays. When
 * neither series has at least two points, renders a friendly empty state
 * instead of a broken chart.
 */
export function TrendChart({ revenueData, ratingData }: TrendChartProps) {
  const hasRevenueTrend = revenueData.length >= 2;
  const hasRatingTrend = ratingData.length >= 2;

  const merged = useMemo<MergedPoint[]>(() => {
    const byKey = new Map<number, MergedPoint>();
    const upsert = (t: number, label: string): MergedPoint => {
      let point = byKey.get(t);
      if (!point) {
        point = { t, label };
        byKey.set(t, point);
      }
      return point;
    };

    if (hasRevenueTrend) {
      for (const p of revenueData) upsert(p.t, p.label).revenue = p.revenue;
    }
    if (hasRatingTrend) {
      for (const p of ratingData) upsert(p.t, p.label).rating = p.rating;
    }

    return [...byKey.values()].sort((a, b) => a.t - b.t);
  }, [revenueData, ratingData, hasRevenueTrend, hasRatingTrend]);

  if (!hasRevenueTrend && !hasRatingTrend) {
    return <EmptyTrendState />;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 ring-1 ring-foreground/10">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={merged}
          margin={{ top: 8, right: 12, bottom: 4, left: 0 }}
        >
          <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
          />
          <YAxis
            yAxisId="revenue"
            orientation="left"
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            tickFormatter={(v: number) => formatCurrency(v)}
            width={64}
          />
          <YAxis
            yAxisId="rating"
            orientation="right"
            domain={[0, 5]}
            ticks={[0, 1, 2, 3, 4, 5]}
            stroke={AXIS_COLOR}
            tick={{ fill: AXIS_COLOR, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: GRID_COLOR }}
            width={32}
          />
          <Tooltip
            contentStyle={{
              background: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
              color: "var(--popover-foreground)",
              fontSize: 12,
            }}
            labelStyle={{ color: "var(--muted-foreground)" }}
            formatter={(value, name) => {
              const num = typeof value === "number" ? value : Number(value);
              return name === "Revenue"
                ? [formatCurrency(num), name as string]
                : [num.toFixed(2), name as string];
            }}
          />
          {hasRevenueTrend && (
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={REVENUE_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: REVENUE_COLOR }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          )}
          {hasRatingTrend && (
            <Line
              yAxisId="rating"
              type="monotone"
              dataKey="rating"
              name="Rating"
              stroke={RATING_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: RATING_COLOR }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: REVENUE_COLOR }}
            aria-hidden
          />
          Revenue
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            className="size-2.5 rounded-full"
            style={{ background: RATING_COLOR }}
            aria-hidden
          />
          Rating (0–5)
        </span>
      </div>
    </div>
  );
}
