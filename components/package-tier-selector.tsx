"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { PackageTier, ServicePackage } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface PackageTierSelectorProps {
  packages: ServicePackage[];
  selectedTier: PackageTier;
  onSelect: (tier: PackageTier) => void;
}

/**
 * PackageTierSelector — renders all packages side-by-side for comparison.
 * Single selection; Standard is marked "Recommended". Selected tier is
 * visually distinguished with a primary ring/border.
 */
export function PackageTierSelector({
  packages,
  selectedTier,
  onSelect,
}: PackageTierSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Select a package"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      {packages.map((pkg) => {
        const selected = pkg.tier === selectedTier;
        const recommended = pkg.tier === "standard";
        return (
          <button
            key={pkg.tier}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(pkg.tier)}
            className={cn(
              "group/tier flex flex-col gap-4 rounded-xl bg-card p-4 text-left text-sm text-card-foreground ring-1 transition-all outline-none",
              "hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "border-primary ring-2 ring-primary"
                : "ring-foreground/10 hover:ring-foreground/20",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-heading text-base font-medium text-foreground">
                {pkg.name}
              </span>
              {recommended && (
                <Badge variant={selected ? "default" : "secondary"}>
                  Recommended
                </Badge>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl font-semibold text-foreground">
                {formatCurrency(pkg.price)}
              </span>
            </div>

            <span className="text-sm text-muted-foreground">
              {pkg.deliveryDays} day delivery
            </span>

            <ul className="flex flex-col gap-1.5">
              {pkg.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <span
              className={cn(
                "mt-auto inline-flex items-center text-xs font-medium",
                selected ? "text-primary" : "text-muted-foreground",
              )}
            >
              {selected ? "Selected" : "Select"}
            </span>
          </button>
        );
      })}
    </div>
  );
}
