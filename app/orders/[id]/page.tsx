"use client";

import { use } from "react";
import Link from "next/link";

import { useStore } from "@/lib/store";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EscrowStepper } from "@/components/escrow-stepper";
import { ChatController } from "@/components/chat-controller";
import { ReviewForm } from "@/components/review-form";

export default function OrderDetailController({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const order = useStore((s) => s.orders.find((o) => o.id === id));
  const users = useStore((s) => s.users);
  const persona = useStore((s) => s.persona);
  const markDelivered = useStore((s) => s.markDelivered);
  const releaseEscrow = useStore((s) => s.releaseEscrow);
  const cancelOrder = useStore((s) => s.cancelOrder);

  if (!order) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Order not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This order may have been removed or never existed.
          </p>
          <Button asChild variant="outline">
            <Link href="/orders">Back to orders</Link>
          </Button>
        </div>
      </main>
    );
  }

  const buyer = users.find((u) => u.id === order.buyerId);
  const seller = users.find((u) => u.id === order.sellerId);

  // Persona-gated actions. Each is shown only for the correct persona AND
  // the correct order status. The store actions are guarded by the escrow
  // state machine, so illegal calls are silent no-ops regardless.
  const canMarkDelivered =
    persona === "seller" && order.status === "in_progress";
  const canReleaseEscrow =
    persona === "buyer" && order.status === "delivered";
  const canCancelOrder = persona === "buyer" && order.status === "held";

  const hasAction = canMarkDelivered || canReleaseEscrow || canCancelOrder;

  // Contextual hint when no action is available for the current viewer.
  let hint: string | null = null;
  if (!hasAction) {
    if (order.status === "in_progress") {
      hint = "Waiting on the seller to deliver.";
    } else if (order.status === "delivered") {
      hint = "Waiting on the buyer to release escrow.";
    } else if (order.status === "held") {
      hint = "Payment is held in escrow while the seller gets started.";
    } else if (order.status === "released") {
      hint = "This order is complete. Payment was released to the seller.";
    } else if (order.status === "cancelled") {
      hint = "This order was cancelled.";
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2.5">
            <Link href="/orders">Back to orders</Link>
          </Button>
        </div>

        <header className="flex flex-col gap-3">
          <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {order.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              Buyer:{" "}
              <span className="text-foreground">
                {buyer?.name ?? "Unknown user"}
              </span>
            </span>
            <span>
              Seller:{" "}
              <span className="text-foreground">
                {seller?.name ?? "Unknown user"}
              </span>
            </span>
            <span>Ordered {formatRelativeTime(new Date(order.createdAt))}</span>
          </div>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Order status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <EscrowStepper status={order.status} />

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Order amount</span>
              <span className="font-medium text-foreground">
                {formatCurrency(order.amount)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Platform fee</span>
              <span className="text-foreground">
                {formatCurrency(order.platformFee)}
              </span>
            </div>

            <Separator />

            {/* Persona-gated escrow actions. */}
            <div className="flex flex-col gap-3">
              {canMarkDelivered && (
                <Button onClick={() => markDelivered(order.id)}>
                  Mark Delivered
                </Button>
              )}
              {canReleaseEscrow && (
                <Button onClick={() => releaseEscrow(order.id)}>
                  Release Escrow
                </Button>
              )}
              {canCancelOrder && (
                <Button
                  variant="destructive"
                  onClick={() => cancelOrder(order.id)}
                >
                  Cancel Order
                </Button>
              )}
              {hint && (
                <p className="text-sm text-muted-foreground">{hint}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* After release, each party may review the other once. */}
        {order.status === "released" && persona === "buyer" && (
          <ReviewForm
            orderId={order.id}
            authorId={order.buyerId}
            rateeUserId={order.sellerId}
            direction="of_seller"
            rateeName={seller?.name}
          />
        )}
        {order.status === "released" && persona === "seller" && (
          <ReviewForm
            orderId={order.id}
            authorId={order.sellerId}
            rateeUserId={order.buyerId}
            direction="of_buyer"
            rateeName={buyer?.name}
          />
        )}

        <ChatController orderId={order.id} />
      </div>
    </main>
  );
}
