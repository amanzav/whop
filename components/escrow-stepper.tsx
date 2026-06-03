"use client";

import { Check, Circle, XCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

interface Stage {
  /** Order status this stage represents. */
  status: Exclude<OrderStatus, "cancelled">;
  label: string;
}

// The four escrow stages, in lifecycle order.
const STAGES: Stage[] = [
  { status: "held", label: "Funds Held" },
  { status: "in_progress", label: "In Progress" },
  { status: "delivered", label: "Delivered" },
  { status: "released", label: "Released" },
];

// Map a status to its stage index. cancelled is handled separately.
const STAGE_INDEX: Record<Exclude<OrderStatus, "cancelled">, number> = {
  held: 0,
  in_progress: 1,
  delivered: 2,
  released: 3,
};

/**
 * Display-only four-stage escrow status indicator. Highlights the current
 * stage, marks completed stages with a check, and mutes upcoming stages.
 * Renders a distinct cancelled state when the order has been cancelled.
 * Performs no transitions.
 */
export function EscrowStepper({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return (
      <div
        role="status"
        className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-destructive ring-1 ring-destructive/20"
      >
        <XCircle className="size-5 shrink-0" />
        <div className="flex flex-col">
          <span className="text-sm font-medium">Order cancelled</span>
          <span className="text-xs text-destructive/80">
            This order was cancelled before any work was delivered.
          </span>
        </div>
      </div>
    );
  }

  const current = STAGE_INDEX[status];

  return (
    <ol className="flex items-center">
      {STAGES.map((stage, index) => {
        const isCompleted = index < current;
        const isCurrent = index === current;
        const isLast = index === STAGES.length - 1;

        return (
          <li
            key={stage.status}
            className={cn(
              "flex items-center",
              !isLast && "flex-1",
            )}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full ring-1 transition-colors",
                  isCompleted &&
                    "bg-primary text-primary-foreground ring-primary",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/30",
                  !isCompleted &&
                    !isCurrent &&
                    "bg-muted text-muted-foreground ring-border",
                )}
              >
                {isCompleted ? (
                  <Check className="size-4" />
                ) : (
                  <Circle
                    className={cn("size-2.5", isCurrent && "fill-current")}
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-center text-xs",
                  isCurrent
                    ? "font-medium text-foreground"
                    : isCompleted
                      ? "text-foreground"
                      : "text-muted-foreground",
                )}
              >
                {stage.label}
              </span>
            </div>

            {!isLast && (
              <div
                aria-hidden
                className={cn(
                  "mx-2 mb-5 h-px flex-1 transition-colors",
                  index < current ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
