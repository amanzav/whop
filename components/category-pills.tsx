"use client";

import { cn } from "@/lib/utils";
import type { Category } from "@/lib/types";

interface CategoryPillsProps {
  categories: Category[];
  activeCategoryId: string | null;
  onSelect: (id: string | null) => void;
}

export function CategoryPills({
  categories,
  activeCategoryId,
  onSelect,
}: CategoryPillsProps) {
  const pillClass = (active: boolean) =>
    cn(
      "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      active
        ? "bg-primary text-primary-foreground"
        : "border border-border bg-card text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={pillClass(activeCategoryId === null)}
      >
        All
      </button>
      {categories.map((category) => {
        const active = activeCategoryId === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(active ? null : category.id)}
            className={pillClass(active)}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
