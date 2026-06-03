"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SearchX } from "lucide-react";

import { useStore } from "@/lib/store";
import type { Service, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GigCard } from "@/components/gig-card";
import { CategoryPills } from "@/components/category-pills";
import { SearchBar } from "@/components/search-bar";

const startingPrice = (service: Service): number =>
  service.packages.length > 0
    ? Math.min(...service.packages.map((p) => p.price))
    : 0;

// Sentinel for "no cap" / "no minimum" since shadcn Select values are strings.
const ANY = "any";

const PRICE_OPTIONS = [
  { value: ANY, label: "Any price", max: null as number | null },
  { value: "200", label: "≤ $200", max: 200 },
  { value: "500", label: "≤ $500", max: 500 },
  { value: "1000", label: "≤ $1000", max: 1000 },
];

const RATING_OPTIONS = [
  { value: ANY, label: "Any rating", min: null as number | null },
  { value: "4.0", label: "4.0+", min: 4.0 },
  { value: "4.5", label: "4.5+", min: 4.5 },
  { value: "4.8", label: "4.8+", min: 4.8 },
];

export default function Home() {
  const services = useStore((s) => s.services);
  const categories = useStore((s) => s.categories);
  const users = useStore((s) => s.users);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState<string>(ANY);
  const [ratingValue, setRatingValue] = useState<string>(ANY);
  const [search, setSearch] = useState("");

  const usersById = useMemo(() => {
    const map = new Map<string, User>();
    for (const user of users) map.set(user.id, user);
    return map;
  }, [users]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) map.set(category.id, category.name);
    return map;
  }, [categories]);

  const maxPrice = useMemo(
    () => PRICE_OPTIONS.find((o) => o.value === priceValue)?.max ?? null,
    [priceValue],
  );
  const minRating = useMemo(
    () => RATING_OPTIONS.find((o) => o.value === ratingValue)?.min ?? null,
    [ratingValue],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return services.filter((service) => {
      if (activeCategoryId && service.categoryId !== activeCategoryId) {
        return false;
      }
      if (maxPrice !== null && startingPrice(service) > maxPrice) {
        return false;
      }
      if (minRating !== null && service.ratingAvg < minRating) {
        return false;
      }
      if (query) {
        const categoryName = categoryNameById.get(service.categoryId) ?? "";
        const haystack =
          `${service.title} ${service.description} ${categoryName}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [
    services,
    activeCategoryId,
    maxPrice,
    minRating,
    search,
    categoryNameById,
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <span className="w-fit rounded-full bg-lemon px-3 py-1 text-xs font-semibold text-lemon-foreground">
            Whop Marketplace
          </span>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Hire vetted sellers. Commission custom work.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            Browse done-for-you gigs from top community builders, course
            creators, and automation experts — or post a task and let sellers
            come to you.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="sm:max-w-md sm:flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <div className="flex gap-2">
              <Select value={priceValue} onValueChange={setPriceValue}>
                <SelectTrigger className="h-10 w-full sm:w-auto">
                  <SelectValue placeholder="Any price" />
                </SelectTrigger>
                <SelectContent>
                  {PRICE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ratingValue} onValueChange={setRatingValue}>
                <SelectTrigger className="h-10 w-full sm:w-auto">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <CategoryPills
            categories={categories}
            activeCategoryId={activeCategoryId}
            onSelect={setActiveCategoryId}
          />
        </div>
      </section>

      <section className="mt-8">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((service) => {
              const seller = usersById.get(service.sellerId);
              if (!seller) return null;
              return (
                <GigCard key={service.id} service={service} seller={seller} />
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="font-heading text-base font-medium text-foreground">
                No gigs match your filters
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Try broadening your search, clearing a filter, or post a task
                and let the right seller come to you.
              </p>
            </div>
            <Button asChild>
              <Link href="/post">Post a Task</Link>
            </Button>
          </div>
        )}
      </section>
    </main>
  );
}
