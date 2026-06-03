"use client";

import { Clock } from "lucide-react";

import { MatchBadge } from "@/components/match-badge";
import { StarRating } from "@/components/star-rating";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { computeLevel, formatCurrency, levelLabel } from "@/lib/format";
import type { Offer, User } from "@/lib/types";

interface OfferCardProps {
  offer: Offer;
  seller: User;
  matchScore: number;
  matchReasons: string[];
  /** Whether the Accept action is available (buyer, task open, none accepted). */
  canAccept: boolean;
  onAccept: () => void;
}

/**
 * OfferCard — display component for a single offer in the buyer's review list.
 * Shows seller context, match badge, proposed terms, pitch, and an optional
 * Accept action. Does not access the store directly.
 */
export function OfferCard({
  offer,
  seller,
  matchScore,
  matchReasons,
  canAccept,
  onAccept,
}: OfferCardProps) {
  const level = levelLabel(
    computeLevel(seller.completedOrderCount, seller.ratingAvg),
  );
  const initials = seller.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-medium text-foreground">
                  {seller.name}
                </span>
                <Badge variant="secondary">{level}</Badge>
              </div>
              <StarRating
                value={seller.ratingAvg}
                count={seller.reviewCount}
                size="sm"
              />
            </div>
          </div>
          <MatchBadge score={matchScore} reasons={matchReasons} />
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-heading text-lg font-semibold text-foreground">
            {formatCurrency(offer.price)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="size-3.5" />
            {offer.deliveryDays} {offer.deliveryDays === 1 ? "day" : "days"}
          </span>
        </div>
        <p className="text-sm text-foreground/90">{offer.message}</p>
      </CardContent>

      {canAccept && (
        <CardFooter>
          <Button onClick={onAccept}>Accept offer</Button>
        </CardFooter>
      )}
    </Card>
  );
}
