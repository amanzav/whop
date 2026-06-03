"use client";

import { useMemo } from "react";
import { Wallet, Activity, Percent, Lock } from "lucide-react";

import { useStore } from "@/lib/store";
import type { Order, Review } from "@/lib/types";
import { formatCurrency } from "@/lib/format";
import { AnalyticsMetricCard } from "@/components/analytics-metric-card";
import {
  TrendChart,
  type RatingPoint,
  type RevenuePoint,
} from "@/components/trend-chart";

// Statuses that count toward the "active orders" metric.
const ACTIVE_STATUSES = new Set<Order["status"]>(["in_progress", "delivered"]);

// Short date label for chart axes, e.g. "Apr 12".
const dateLabel = (iso: string): string =>
  new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

function GatedState() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
        <Lock className="size-8 text-muted-foreground" />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-semibold text-foreground">
            Seller analytics
          </h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            The analytics dashboard is only available in Seller mode.
          </p>
        </div>
      </div>
    </main>
  );
}

/**
 * Seller-only analytics dashboard. Reads the seller's orders, offers, and
 * reviews from the store and computes earnings, active-order count, and
 * conversion rate synchronously on every render. Triggers no store mutations.
 */
export default function SellerDashboardController() {
  const persona = useStore((s) => s.persona);
  const sellerUserId = useStore((s) => s.sellerUserId);
  const orders = useStore((s) => s.orders);
  const offers = useStore((s) => s.offers);
  const reviews = useStore((s) => s.reviews);

  const isSeller = persona === "seller";

  // Seller's slices of the store.
  const sellerOrders = useMemo(
    () => orders.filter((o) => o.sellerId === sellerUserId),
    [orders, sellerUserId],
  );
  const sellerOffers = useMemo(
    () => offers.filter((o) => o.sellerId === sellerUserId),
    [offers, sellerUserId],
  );
  const sellerReviews = useMemo(
    () =>
      reviews.filter(
        (r) => r.targetId === sellerUserId && r.direction === "of_seller",
      ),
    [reviews, sellerUserId],
  );

  // --- Metrics ---
  const totalEarnings = useMemo(
    () =>
      sellerOrders
        .filter((o) => o.status === "released")
        .reduce((sum, o) => sum + o.amount, 0),
    [sellerOrders],
  );

  const activeOrders = useMemo(
    () => sellerOrders.filter((o) => ACTIVE_STATUSES.has(o.status)).length,
    [sellerOrders],
  );

  const { conversionLabel } = useMemo(() => {
    const total = sellerOffers.length;
    if (total === 0) return { conversionLabel: "N/A" };
    const accepted = sellerOffers.filter((o) => o.status === "accepted").length;
    const rate = Math.round((accepted / total) * 100);
    return { conversionLabel: `${rate}%` };
  }, [sellerOffers]);

  // --- Trend series ---
  // Revenue: released orders by date (counted revenue once payment clears).
  const revenueData = useMemo<RevenuePoint[]>(() => {
    return sellerOrders
      .filter((o) => o.status === "released")
      .map<RevenuePoint>((o) => ({
        label: dateLabel(o.createdAt),
        t: new Date(o.createdAt).getTime(),
        revenue: o.amount,
      }))
      .sort((a, b) => a.t - b.t);
  }, [sellerOrders]);

  // Rating: reviews received over time.
  const ratingData = useMemo<RatingPoint[]>(() => {
    return sellerReviews
      .map<RatingPoint>((r: Review) => ({
        label: dateLabel(r.createdAt),
        t: new Date(r.createdAt).getTime(),
        rating: r.rating,
      }))
      .sort((a, b) => a.t - b.t);
  }, [sellerReviews]);

  if (!isSeller) return <GatedState />;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Analytics
        </h1>
        <p className="text-base text-muted-foreground">
          Your earnings, active work, and conversion at a glance.
        </p>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        <AnalyticsMetricCard
          label="Total earnings"
          value={formatCurrency(totalEarnings)}
          icon={<Wallet />}
          hint="Released order payouts"
        />
        <AnalyticsMetricCard
          label="Active orders"
          value={String(activeOrders)}
          icon={<Activity />}
          hint="In progress or delivered"
        />
        <AnalyticsMetricCard
          label="Conversion rate"
          value={conversionLabel}
          icon={<Percent />}
          hint="Accepted offers of total sent"
        />
      </section>

      <section className="mt-8 flex flex-col gap-3">
        <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">
          Revenue & rating trend
        </h2>
        <TrendChart revenueData={revenueData} ratingData={ratingData} />
      </section>
    </main>
  );
}
