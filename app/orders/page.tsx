"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Package, ArrowRight, UserCircle2 } from "lucide-react";

import { useStore } from "@/lib/store";
import type { Order, OrderStatus, User } from "@/lib/types";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Inline escrow status presentation. Active statuses (held, in_progress,
// delivered) read as live work; terminal statuses (released, cancelled) are
// dimmer. Kept inline to avoid any file overlap with the order detail agent.
const STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    badgeVariant: "default" | "secondary" | "outline" | "destructive";
    dot: string;
    active: boolean;
  }
> = {
  held: {
    label: "In escrow",
    badgeVariant: "secondary",
    dot: "bg-amber-500",
    active: true,
  },
  in_progress: {
    label: "In progress",
    badgeVariant: "secondary",
    dot: "bg-blue-500",
    active: true,
  },
  delivered: {
    label: "Delivered",
    badgeVariant: "secondary",
    dot: "bg-violet-500",
    active: true,
  },
  released: {
    label: "Released",
    badgeVariant: "default",
    dot: "bg-primary",
    active: false,
  },
  cancelled: {
    label: "Cancelled",
    badgeVariant: "destructive",
    dot: "bg-destructive",
    active: false,
  },
};

function OrderRow({
  order,
  counterpartyName,
  counterpartyLabel,
}: {
  order: Order;
  counterpartyName: string;
  counterpartyLabel: string;
}) {
  const meta = STATUS_META[order.status];

  return (
    <Link
      href={`/orders/${order.id}`}
      className={cn(
        "group flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 ring-1 ring-foreground/5 transition-colors hover:bg-muted/50",
        !meta.active && "opacity-75",
      )}
    >
      <span
        className={cn("size-2 shrink-0 rounded-full", meta.dot)}
        aria-hidden
      />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate font-heading text-base font-medium text-foreground">
          {order.title}
        </p>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UserCircle2 className="size-3.5" />
            {counterpartyLabel} {counterpartyName}
          </span>
          <span aria-hidden>·</span>
          <span>{formatRelativeTime(new Date(order.createdAt))}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <span className="font-heading text-base font-semibold text-foreground">
          {formatCurrency(order.amount)}
        </span>
        <Badge variant={meta.badgeVariant}>{meta.label}</Badge>
      </div>

      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function EmptyState({ message, hint }: { message: string; hint: string }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
      <Package className="size-8 text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="font-heading text-base font-medium text-foreground">
          {message}
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>
      </div>
      <Link
        href="/"
        className="text-sm font-medium text-primary underline-offset-4 hover:underline"
      >
        Browse gigs
      </Link>
    </div>
  );
}

export default function OrdersController() {
  const orders = useStore((s) => s.orders);
  const users = useStore((s) => s.users);
  const persona = useStore((s) => s.persona);
  const buyerUserId = useStore((s) => s.buyerUserId);
  const sellerUserId = useStore((s) => s.sellerUserId);

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const user of users) map.set(user.id, user);
    return map;
  }, [users]);

  // Active persona user; null for guest.
  const activeUserId =
    persona === "buyer"
      ? buyerUserId
      : persona === "seller"
        ? sellerUserId
        : null;

  // Orders where the active persona user is a participant on the matching side.
  const myOrders = useMemo(() => {
    if (!activeUserId) return [];
    if (persona === "buyer") {
      return orders.filter((o) => o.buyerId === activeUserId);
    }
    return orders.filter((o) => o.sellerId === activeUserId);
  }, [orders, activeUserId, persona]);

  // Counterparty is the other side of the order, relative to the active view.
  const counterpartyLabel = persona === "buyer" ? "Seller:" : "Buyer:";
  const counterpartyNameFor = (order: Order): string => {
    const id = persona === "buyer" ? order.sellerId : order.buyerId;
    return usersById.get(id)?.name ?? "Unknown";
  };

  // Surface active work first; completed/cancelled fall to the bottom.
  const { activeOrders, pastOrders } = useMemo(() => {
    const active: Order[] = [];
    const past: Order[] = [];
    for (const order of myOrders) {
      (STATUS_META[order.status].active ? active : past).push(order);
    }
    return { activeOrders: active, pastOrders: past };
  }, [myOrders]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Orders
        </h1>
        <p className="text-base text-muted-foreground">
          {persona === "guest"
            ? "Switch to a buyer or seller persona to track your orders."
            : "Track your active and past orders and their escrow status."}
        </p>
      </section>

      <section className="mt-8 flex flex-col gap-8">
        {persona === "guest" ? (
          <EmptyState
            message="No orders to show"
            hint="Switch to the buyer or seller persona to see orders you're part of."
          />
        ) : myOrders.length === 0 ? (
          <EmptyState
            message="No orders yet"
            hint={
              persona === "buyer"
                ? "When you buy a gig or accept an offer, your orders will show up here."
                : "When a buyer hires you or accepts your offer, your orders will show up here."
            }
          />
        ) : (
          <>
            {activeOrders.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Active
                </h2>
                <div className="flex flex-col gap-3">
                  {activeOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      counterpartyName={counterpartyNameFor(order)}
                      counterpartyLabel={counterpartyLabel}
                    />
                  ))}
                </div>
              </div>
            )}

            {pastOrders.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
                  Completed
                </h2>
                <div className="flex flex-col gap-3">
                  {pastOrders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      counterpartyName={counterpartyNameFor(order)}
                      counterpartyLabel={counterpartyLabel}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
