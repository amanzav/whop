import Link from "next/link";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency, computeLevel, levelLabel } from "@/lib/format";
import type { Service, User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface GigCardProps {
  service: Service;
  seller: User;
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

export function GigCard({ service, seller }: GigCardProps) {
  const startingPrice =
    service.packages.length > 0
      ? Math.min(...service.packages.map((p) => p.price))
      : 0;
  const deliveryDays =
    service.packages.length > 0
      ? Math.min(...service.packages.map((p) => p.deliveryDays))
      : 0;
  const level = computeLevel(seller.completedOrderCount, seller.ratingAvg);

  return (
    <Link
      href={`/gig/${service.id}`}
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card
        size="sm"
        className={cn(
          "h-full transition-all hover:ring-foreground/20",
          "hover:-translate-y-0.5 hover:shadow-lg",
        )}
      >
        <CardHeader>
          <div className="flex items-center gap-2">
            <Avatar size="sm">
              <AvatarImage src={seller.avatar} alt={seller.name} />
              <AvatarFallback>{initials(seller.name)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium text-foreground">
                {seller.name}
              </span>
              <Badge variant="secondary" className="w-fit">
                {levelLabel(level)}
              </Badge>
            </div>
          </div>
          <CardTitle className="mt-2 line-clamp-2">{service.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="size-3.5 fill-primary text-primary" />
          <span className="font-medium text-foreground">
            {service.ratingAvg.toFixed(1)}
          </span>
          <span>({service.reviewCount})</span>
          <span className="ml-auto">{deliveryDays} day delivery</span>
        </CardContent>

        <CardFooter className="justify-between">
          <span className="text-xs text-muted-foreground">Starting at</span>
          <span className="font-heading text-base font-semibold text-foreground">
            {formatCurrency(startingPrice)}
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
