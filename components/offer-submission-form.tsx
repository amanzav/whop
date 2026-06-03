"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";

interface OfferSubmissionFormProps {
  taskId: string;
  /** Called after a successful submission. */
  onSubmitted?: () => void;
}

interface FieldErrors {
  price?: string;
  deliveryDays?: string;
  message?: string;
}

/**
 * OfferSubmissionForm — local-state form for a seller to submit one offer on a
 * task. Validates all fields, then calls the store's submitOffer (which fires
 * its own toast) and disables itself after a successful submit.
 */
export function OfferSubmissionForm({
  taskId,
  onSubmitted,
}: OfferSubmissionFormProps) {
  const submitOffer = useStore((s) => s.submitOffer);

  const [price, setPrice] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const priceNum = Number(price);
    const daysNum = Number(deliveryDays);

    if (price.trim() === "" || Number.isNaN(priceNum) || priceNum <= 0) {
      next.price = "Enter a price greater than 0.";
    }
    if (
      deliveryDays.trim() === "" ||
      Number.isNaN(daysNum) ||
      daysNum <= 0
    ) {
      next.deliveryDays = "Enter delivery days greater than 0.";
    }
    if (message.trim() === "") {
      next.message = "A pitch message is required.";
    }
    return next;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const result = submitOffer(taskId, {
      price: Number(price),
      deliveryDays: Number(deliveryDays),
      message: message.trim(),
    });

    if (result) {
      setSubmitted(true);
      onSubmitted?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit an offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="offer-price">Proposed price (USD)</Label>
            <Input
              id="offer-price"
              type="number"
              min={1}
              step="1"
              inputMode="numeric"
              placeholder="500"
              value={price}
              disabled={submitted}
              aria-invalid={!!errors.price}
              onChange={(e) => setPrice(e.target.value)}
            />
            {errors.price && (
              <p className="text-xs text-destructive">{errors.price}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="offer-days">Delivery days</Label>
            <Input
              id="offer-days"
              type="number"
              min={1}
              step="1"
              inputMode="numeric"
              placeholder="7"
              value={deliveryDays}
              disabled={submitted}
              aria-invalid={!!errors.deliveryDays}
              onChange={(e) => setDeliveryDays(e.target.value)}
            />
            {errors.deliveryDays && (
              <p className="text-xs text-destructive">
                {errors.deliveryDays}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="offer-message">Pitch message</Label>
            <Textarea
              id="offer-message"
              placeholder="Tell the buyer why you're the right fit…"
              value={message}
              disabled={submitted}
              aria-invalid={!!errors.message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {errors.message && (
              <p className="text-xs text-destructive">{errors.message}</p>
            )}
          </div>

          <div>
            <Button type="submit" disabled={submitted}>
              {submitted ? "Offer submitted" : "Submit offer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
