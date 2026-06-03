"use client";

import { useSession } from "next-auth/react";
import { ShoppingBag, Store } from "lucide-react";

import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";

const OPTIONS: { value: Role; label: string; icon: typeof Store }[] = [
  { value: "buyer", label: "Buyer", icon: ShoppingBag },
  { value: "seller", label: "Seller", icon: Store },
];

/**
 * RoleContextSwitcher — Buyer/Seller toggle, visible to authenticated users
 * only. Switching is instantaneous (no confirmation, no reload).
 */
export function RoleContextSwitcher() {
  const { status } = useSession();
  const role = useStore((s) => s.role);
  const setRole = useStore((s) => s.setRole);

  if (status !== "authenticated") return null;

  return (
    <div
      role="tablist"
      aria-label="Role context"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const selected = role === value;
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => setRole(value)}
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
