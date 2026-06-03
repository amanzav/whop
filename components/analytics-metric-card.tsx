"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsMetricCardProps {
  /** Short metric label, e.g. "Total earnings". */
  label: string;
  /** Pre-formatted display value, e.g. "$1,100", "3", "42%", or "N/A". */
  value: string;
  /** Optional leading icon (a lucide-react icon element). */
  icon?: ReactNode;
  /** Optional supporting line under the value. */
  hint?: string;
}

/**
 * Display-only metric tile. The caller is responsible for formatting `value`
 * (currency, percent, counts); this component simply renders the label, the
 * large value, and an optional hint. Empty / "N/A" values are passed through
 * as-is and shown muted so zero states read gracefully.
 */
export function AnalyticsMetricCard({
  label,
  value,
  icon,
  hint,
}: AnalyticsMetricCardProps) {
  const isEmpty = value.trim() === "" || value === "N/A";
  const displayValue = value.trim() === "" ? "N/A" : value;

  return (
    <Card className="gap-3">
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {icon && (
            <span className="flex size-5 items-center justify-center text-muted-foreground [&>svg]:size-4">
              {icon}
            </span>
          )}
          <span>{label}</span>
        </div>

        <p
          className={cn(
            "font-heading text-3xl leading-none font-semibold tracking-tight tabular-nums",
            isEmpty ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {displayValue}
        </p>

        {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
