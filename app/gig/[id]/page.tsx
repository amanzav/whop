"use client";

import { use, useState } from "react";
import Link from "next/link";

import { useStore } from "@/lib/store";
import { computeLevel, levelLabel } from "@/lib/format";
import type { PackageTier } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StarRating } from "@/components/star-rating";
import { PackageTierSelector } from "@/components/package-tier-selector";
import { CheckoutPanel } from "@/components/checkout-panel";

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function GigDetailController({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const service = useStore((s) => s.services.find((sv) => sv.id === id));
  const users = useStore((s) => s.users);
  const reviews = useStore((s) => s.reviews);
  const persona = useStore((s) => s.persona);

  const [selectedTier, setSelectedTier] = useState<PackageTier>("standard");

  if (!service) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-2xl font-semibold text-foreground">
            Gig not found
          </h1>
          <p className="text-sm text-muted-foreground">
            This gig may have been removed or never existed.
          </p>
          <Button asChild variant="outline">
            <Link href="/">Back to marketplace</Link>
          </Button>
        </div>
      </main>
    );
  }

  const seller = users.find((u) => u.id === service.sellerId);
  const sellerReviews = seller
    ? reviews.filter(
        (r) => r.targetId === seller.id && r.direction === "of_seller",
      )
    : [];

  const selectedPackage =
    service.packages.find((p) => p.tier === selectedTier) ??
    service.packages[0];

  const level = seller
    ? computeLevel(seller.completedOrderCount, seller.ratingAvg)
    : null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: content */}
        <div className="flex flex-col gap-8">
          <header className="flex flex-col gap-3">
            <h1 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
              {service.title}
            </h1>
            <div className="flex items-center gap-2">
              <StarRating
                value={service.ratingAvg}
                count={service.reviewCount}
                showValue
              />
            </div>
          </header>

          {service.images.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {service.images.map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt={`${service.title} preview ${i + 1}`}
                  className="aspect-video w-full rounded-xl object-cover ring-1 ring-foreground/10"
                />
              ))}
            </div>
          )}

          <section className="flex flex-col gap-2">
            <h2 className="font-heading text-lg font-medium text-foreground">
              About this gig
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {service.description}
            </p>
          </section>

          {seller && (
            <>
              <Separator />
              <section className="flex flex-col gap-3">
                <h2 className="font-heading text-lg font-medium text-foreground">
                  About the seller
                </h2>
                <div className="flex items-center gap-3">
                  <Avatar size="lg">
                    <AvatarImage src={seller.avatar} alt={seller.name} />
                    <AvatarFallback>{initials(seller.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {seller.name}
                      </span>
                      {level && (
                        <Badge variant="secondary">{levelLabel(level)}</Badge>
                      )}
                    </div>
                    <StarRating
                      value={seller.ratingAvg}
                      count={seller.reviewCount}
                      size="sm"
                      showValue
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{seller.bio}</p>
              </section>
            </>
          )}

          <Separator />

          <section className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-medium text-foreground">
              Packages
            </h2>
            <PackageTierSelector
              packages={service.packages}
              selectedTier={selectedTier}
              onSelect={setSelectedTier}
            />
          </section>

          <Separator />

          <section className="flex flex-col gap-4">
            <h2 className="font-heading text-lg font-medium text-foreground">
              Reviews
            </h2>
            {sellerReviews.length === 0 ? (
              <p className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground">
                No reviews yet. Be the first to work with this seller.
              </p>
            ) : (
              <ul className="flex flex-col gap-4">
                {sellerReviews.map((review) => {
                  const author = users.find((u) => u.id === review.authorId);
                  return (
                    <li key={review.id}>
                      <Card size="sm">
                        <CardHeader>
                          <div className="flex items-center gap-3">
                            <Avatar size="sm">
                              {author && (
                                <AvatarImage
                                  src={author.avatar}
                                  alt={author.name}
                                />
                              )}
                              <AvatarFallback>
                                {initials(author?.name ?? "?")}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium text-foreground">
                                {author?.name ?? "Unknown user"}
                              </span>
                              <StarRating value={review.rating} size="sm" />
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                          {review.comment}
                        </CardContent>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Right: checkout */}
        <aside className="flex flex-col gap-6 lg:sticky lg:top-20 lg:self-start">
          {selectedPackage && seller && (
            <CheckoutPanel
              selectedPackage={selectedPackage}
              serviceId={service.id}
              sellerName={seller.name}
              persona={persona}
              onCancel={() => setSelectedTier("standard")}
            />
          )}
        </aside>
      </div>
    </main>
  );
}
