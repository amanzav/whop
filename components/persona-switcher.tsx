"use client";

import { Eye, ShoppingBag, Store } from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import type { Persona } from "@/lib/types";

const OPTIONS: { value: Persona; label: string; icon: typeof Eye }[] = [
  { value: "guest", label: "Guest", icon: Eye },
  { value: "buyer", label: "Buyer", icon: ShoppingBag },
  { value: "seller", label: "Seller", icon: Store },
];

export function PersonaSwitcher() {
  const persona = useStore((s) => s.persona);
  const setPersona = useStore((s) => s.setPersona);
  const hydrated = useHydrated();
  const active: Persona = hydrated ? persona : "guest";

  return (
    <div
      role="tablist"
      aria-label="Persona switcher"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = active === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => setPersona(value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              selected
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
