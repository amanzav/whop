"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";

interface MatchBadgeProps {
  /** Match score, typically clamped to [60, 99]. */
  score: number;
  /** Human-readable reasons; reasons[0] is the top contributing factor. */
  reasons: string[];
  /** Compact inline variant: score + first reason on one line. */
  compact?: boolean;
  className?: string;
}

/**
 * MatchBadge — renders a seller-task compatibility score prominently as
 * "NN% match" with the top reason beneath. Score and reasons are computed by
 * the Match Engine (lib/match.ts) and passed in as props.
 */
export function MatchBadge({
  score,
  reasons,
  compact = false,
  className,
}: MatchBadgeProps) {
  const topReason = reasons[0];

  if (compact) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-foreground",
          className,
        )}
      >
        <Sparkles className="size-3 text-primary" />
        <span className="font-semibold">{score}% match</span>
        {topReason && (
          <span className="text-muted-foreground">· {topReason}</span>
        )}
      </span>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-0.5 rounded-lg bg-primary/10 px-3 py-2 ring-1 ring-primary/20",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Sparkles className="size-3.5 text-primary" />
        {score}% match
      </span>
      {topReason && (
        <span className="text-xs text-muted-foreground">{topReason}</span>
      )}
    </div>
  );
}
