"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

import { MatchBadge } from "@/components/match-badge";
import { OfferCard } from "@/components/offer-card";
import { OfferSubmissionForm } from "@/components/offer-submission-form";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  computeLevel,
  formatCurrency,
  formatRelativeTime,
  levelLabel,
} from "@/lib/format";
import { rankSellersForTask, scoreMatch } from "@/lib/match";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";

const initialsOf = (name: string): string =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function TaskDetailController({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const persona = useStore((s) => s.persona);
  const tasks = useStore((s) => s.tasks);
  const offers = useStore((s) => s.offers);
  const users = useStore((s) => s.users);
  const categories = useStore((s) => s.categories);
  const sellerUserId = useStore((s) => s.sellerUserId);
  const acceptOffer = useStore((s) => s.acceptOffer);

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12">
        <h1 className="font-heading text-xl font-semibold text-foreground">
          Task not found
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This task may have been removed.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Back to home</Link>
        </Button>
      </main>
    );
  }

  const category = categories.find((c) => c.id === task.categoryId);
  const buyer = users.find((u) => u.id === task.buyerId);
  const sellers = users.filter((u) => u.roles.includes("Seller"));

  const taskOffers = offers.filter((o) => o.taskId === task.id);
  const pendingOffers = taskOffers.filter((o) => o.status === "pending");
  const hasAcceptedOffer = taskOffers.some((o) => o.status === "accepted");

  const sellerUser = users.find((u) => u.id === sellerUserId);
  const alreadyOffered = taskOffers.some((o) => o.sellerId === sellerUserId);
  const mySubmittedOffer = taskOffers.find(
    (o) => o.sellerId === sellerUserId,
  );

  const handleAccept = (offerId: string) => {
    const orderId = acceptOffer(offerId);
    if (orderId) router.push(`/orders/${orderId}`);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      {/* Base info — visible to all personas */}
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {category && <Badge variant="secondary">{category.name}</Badge>}
          <span className="text-xs text-muted-foreground">
            Posted {formatRelativeTime(new Date(task.createdAt))}
          </span>
        </div>
        <h1 className="font-heading text-2xl font-semibold text-foreground">
          {task.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatCurrency(task.budgetMin)} – {formatCurrency(task.budgetMax)}
          </span>
          {buyer && <span>Posted by {buyer.name}</span>}
        </div>
        <p className="whitespace-pre-line text-sm text-foreground/90">
          {task.description}
        </p>
        {task.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.requiredSkills.map((skill) => (
              <Badge key={skill} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </header>

      <Separator className="my-8" />

      {persona === "buyer" && (
        <BuyerView
          recommendedSellers={rankSellersForTask(task, sellers)}
          pendingOffers={pendingOffers}
          users={users}
          canAccept={task.status === "open" && !hasAcceptedOffer}
          onAccept={handleAccept}
          matchFor={(seller) => scoreMatch(task, seller)}
        />
      )}

      {persona === "seller" && sellerUser && (
        <SellerView
          match={scoreMatch(task, sellerUser)}
          taskId={task.id}
          taskOpen={task.status === "open"}
          alreadyOffered={alreadyOffered}
          submittedOffer={mySubmittedOffer}
        />
      )}

      {/* Guest: base info only, nothing further. */}
    </main>
  );
}

function BuyerView({
  recommendedSellers,
  pendingOffers,
  users,
  canAccept,
  onAccept,
  matchFor,
}: {
  recommendedSellers: User[];
  pendingOffers: ReturnType<typeof useStore.getState>["offers"];
  users: User[];
  canAccept: boolean;
  onAccept: (offerId: string) => void;
  matchFor: (seller: User) => { score: number; reasons: string[] };
}) {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Recommended sellers
        </h2>
        <div className="flex flex-col gap-3">
          {recommendedSellers.map((seller) => {
            const { score, reasons } = matchFor(seller);
            return (
              <Link
                key={seller.id}
                href={`/profile/${seller.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={seller.avatar} alt={seller.name} />
                    <AvatarFallback>{initialsOf(seller.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading text-sm font-medium text-foreground">
                        {seller.name}
                      </span>
                      <Badge variant="secondary">
                        {levelLabel(
                          computeLevel(
                            seller.completedOrderCount,
                            seller.ratingAvg,
                          ),
                        )}
                      </Badge>
                    </div>
                    <StarRating
                      value={seller.ratingAvg}
                      count={seller.reviewCount}
                      size="sm"
                    />
                  </div>
                </div>
                <MatchBadge score={score} reasons={reasons} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Offers received
        </h2>
        {pendingOffers.length === 0 ? (
          <p className="rounded-xl bg-card px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
            No offers yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {pendingOffers.map((offer) => {
              const seller = users.find((u) => u.id === offer.sellerId);
              if (!seller) return null;
              const computed = matchFor(seller);
              const matchScore = offer.matchScore ?? computed.score;
              return (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  seller={seller}
                  matchScore={matchScore}
                  matchReasons={computed.reasons}
                  canAccept={canAccept}
                  onAccept={() => onAccept(offer.id)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function SellerView({
  match,
  taskId,
  taskOpen,
  alreadyOffered,
  submittedOffer,
}: {
  match: { score: number; reasons: string[] };
  taskId: string;
  taskOpen: boolean;
  alreadyOffered: boolean;
  submittedOffer:
    | ReturnType<typeof useStore.getState>["offers"][number]
    | undefined;
}) {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="font-heading text-lg font-semibold text-foreground">
          Your match score
        </h2>
        <Card>
          <CardContent className="flex flex-col gap-3">
            <span className="inline-flex items-center gap-2 font-heading text-3xl font-semibold text-foreground">
              {match.score}%
              <span className="text-base font-normal text-muted-foreground">
                match
              </span>
            </span>
            <ul className="flex flex-col gap-1.5">
              {match.reasons.map((reason) => (
                <li
                  key={reason}
                  className="flex items-center gap-2 text-sm text-foreground/90"
                >
                  <span className="size-1.5 rounded-full bg-primary" />
                  {reason}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {taskOpen && !alreadyOffered && (
        <section>
          <OfferSubmissionForm taskId={taskId} />
        </section>
      )}

      {alreadyOffered && submittedOffer && (
        <section className="flex flex-col gap-4">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            Your offer
          </h2>
          <Card>
            <CardHeader>
              <CardTitle>You&apos;ve already submitted an offer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-4">
                <span className="font-heading text-lg font-semibold text-foreground">
                  {formatCurrency(submittedOffer.price)}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  {submittedOffer.deliveryDays}{" "}
                  {submittedOffer.deliveryDays === 1 ? "day" : "days"}
                </span>
                <Badge variant="secondary">{submittedOffer.status}</Badge>
              </div>
              <p className="text-sm text-foreground/90">
                {submittedOffer.message}
              </p>
            </CardContent>
          </Card>
        </section>
      )}

      {!taskOpen && !alreadyOffered && (
        <p className="rounded-xl bg-card px-4 py-6 text-sm text-muted-foreground ring-1 ring-foreground/10">
          This task is no longer open for offers.
        </p>
      )}
    </div>
  );
}
