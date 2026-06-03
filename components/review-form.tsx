"use client";

import { useState } from "react";

import { useStore } from "@/lib/store";
import type { ReviewDirection } from "@/lib/types";
import { StarRating } from "@/components/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ReviewFormProps {
  orderId: string;
  /** The user being reviewed. */
  rateeUserId: string;
  /** The user leaving the review (active participant). */
  authorId: string;
  direction: ReviewDirection;
  /** Friendly label for who is being reviewed, e.g. the seller's name. */
  rateeName?: string;
}

/**
 * ReviewForm — leave a 1–5 star review after an order is released. Renders
 * nothing once a review for this order/direction already exists.
 */
export function ReviewForm({
  orderId,
  rateeUserId,
  authorId,
  direction,
  rateeName,
}: ReviewFormProps) {
  const addReview = useStore((s) => s.addReview);
  const alreadyReviewed = useStore((s) =>
    s.reviews.some((r) => r.orderId === orderId && r.direction === direction),
  );

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Hidden once a review for this order/direction exists in the store.
  if (alreadyReviewed) return null;

  const handleSubmit = () => {
    if (rating < 1) {
      setError("Please select a star rating.");
      return;
    }
    addReview({
      orderId,
      authorId,
      targetId: rateeUserId,
      rating,
      comment: comment.trim(),
      direction,
    });
    // The store now holds the review, so this component unmounts on re-render.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Leave a review{rateeName ? ` for ${rateeName}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>Your rating</Label>
          <StarRating
            value={rating}
            interactive
            size="lg"
            onChange={(v) => {
              setRating(v);
              setError(null);
            }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="review-comment">Comment (optional)</Label>
          <Textarea
            id="review-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share how the work went…"
            rows={3}
          />
        </div>
        <div>
          <Button onClick={handleSubmit}>Submit review</Button>
        </div>
      </CardContent>
    </Card>
  );
}
