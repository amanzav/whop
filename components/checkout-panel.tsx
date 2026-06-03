"use client";

import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { useStore, PLATFORM_FEE_RATE } from "@/lib/store";
import { formatCurrency } from "@/lib/format";
import type { ServicePackage } from "@/lib/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface CheckoutPanelProps {
  selectedPackage: ServicePackage;
  serviceId: string;
  sellerName: string;
  /** Optional cancel handler from the parent. */
  onCancel?: () => void;
}

/**
 * CheckoutPanel — cost breakdown and purchase confirmation.
 * Shows package price, platform fee, total, and an escrow note. Confirm is
 * only available when signed in with the Buyer role. On confirm, creates the
 * order via buyGig and navigates to the new order detail page.
 */
export function CheckoutPanel({
  selectedPackage,
  serviceId,
  sellerName,
  onCancel,
}: CheckoutPanelProps) {
  const router = useRouter();
  const buyGig = useStore((s) => s.buyGig);
  const currentUserId = useStore((s) => s.currentUserId);
  const role = useStore((s) => s.role);

  const price = selectedPackage.price;
  const platformFee = Math.round(price * PLATFORM_FEE_RATE);
  const total = price + platformFee;
  const isBuyer = !!currentUserId && role === "buyer";

  const handleConfirm = () => {
    const orderId = buyGig(serviceId, selectedPackage.tier);
    if (orderId) {
      router.push(`/orders/${orderId}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Checkout</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{selectedPackage.name}</span>
            <span className="font-medium text-foreground">
              {formatCurrency(price)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="font-medium text-foreground">
              {selectedPackage.deliveryDays}{" "}
              {selectedPackage.deliveryDays === 1 ? "day" : "days"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Platform fee ({Math.round(PLATFORM_FEE_RATE * 100)}%)
            </span>
            <span className="font-medium text-foreground">
              {formatCurrency(platformFee)}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-medium text-foreground">Total</span>
          <span className="font-heading text-lg font-semibold text-foreground">
            {formatCurrency(total)}
          </span>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            Payment is held in escrow until you confirm delivery from{" "}
            {sellerName}.
          </span>
        </div>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            size="lg"
            onClick={handleConfirm}
            disabled={!isBuyer}
            className="w-full"
          >
            Confirm purchase
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            className="w-full"
          >
            Cancel
          </Button>
          {!isBuyer && (
            <p className="rounded-lg bg-muted/50 px-3 py-2 text-center text-xs text-muted-foreground">
              {currentUserId
                ? "Switch to Buyer mode to purchase."
                : "Sign in as a buyer to purchase."}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
