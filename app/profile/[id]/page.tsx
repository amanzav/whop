"use client";

import { use, useMemo } from "react";
import Link from "next/link";

import { useStore } from "@/lib/store";
import { computeLevel, levelLabel, formatRelativeTime } from "@/lib/format";
import { StarRating } from "@/components/star-rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function ProfileController({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const user = useStore((s) => s.users.find((u) => u.id === id));
  const users = useStore((s) => s.users);
  const allReviews = useStore((s) => s.reviews);
  const reviews = useMemo(
    () => allReviews.filter((r) => r.targetId === id),
    [allReviews, id],
  );

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Profile not found
          </h1>
          <Button asChild variant="outline">
            <Link href="/">Back to marketplace</Link>
          </Button>
        </div>
      </main>
    );
  }

  const isSeller = user.roles.includes("Seller");
  const level = computeLevel(user.completedOrderCount, user.ratingAvg);
  const authorName = (authorId: string) =>
    users.find((u) => u.id === authorId)?.name ?? "Unknown user";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <Avatar className="size-20">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{initials(user.name)}</AvatarFallback>
            </Avatar>

            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-heading text-2xl font-semibold text-foreground">
                  {user.name}
                </h1>
                {isSeller && (
                  <Badge variant="secondary">{levelLabel(level)}</Badge>
                )}
              </div>

              <p className="text-sm text-muted-foreground">{user.bio}</p>

              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <StarRating value={user.ratingAvg} showValue size="default" />
                  <span className="text-sm text-muted-foreground">
                    ({user.reviewCount} review{user.reviewCount === 1 ? "" : "s"})
                  </span>
                </div>
                {isSeller && (
                  <span className="text-sm text-muted-foreground">
                    {user.completedOrderCount} completed order
                    {user.completedOrderCount === 1 ? "" : "s"}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviews</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet.
              </p>
            ) : (
              reviews.map((review, index) => (
                <div key={review.id} className="flex flex-col gap-2">
                  {index > 0 && <Separator className="mb-2" />}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-foreground">
                      {authorName(review.authorId)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(new Date(review.createdAt))}
                    </span>
                  </div>
                  <StarRating value={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
