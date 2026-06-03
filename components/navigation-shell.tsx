"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useHydrated } from "@/lib/hooks/use-hydrated";
import type { Persona } from "@/lib/types";
import { PersonaSwitcher } from "@/components/persona-switcher";

interface NavLink {
  label: string;
  href: string;
}

const NAV_BY_PERSONA: Record<Persona, NavLink[]> = {
  guest: [
    { label: "Browse Gigs", href: "/" },
    { label: "Task Board", href: "/tasks" },
  ],
  buyer: [
    { label: "Browse Gigs", href: "/" },
    { label: "Task Board", href: "/tasks" },
    { label: "Post a Task", href: "/post" },
    { label: "Orders", href: "/orders" },
  ],
  seller: [
    { label: "Browse Gigs", href: "/" },
    { label: "Task Board", href: "/tasks" },
    { label: "My Offers", href: "/tasks?mine=1" },
    { label: "My Orders", href: "/orders" },
    { label: "Dashboard", href: "/dashboard" },
  ],
};

const isActive = (pathname: string, href: string): boolean => {
  const base = href.split("?")[0];
  if (base === "/") return pathname === "/";
  return pathname === base || pathname.startsWith(`${base}/`);
};

export function NavigationShell() {
  const persona = useStore((s) => s.persona);
  const pathname = usePathname();
  const hydrated = useHydrated();
  const active: Persona = hydrated ? persona : "guest";
  const links = NAV_BY_PERSONA[active];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="grid size-6 place-items-center rounded-md bg-primary text-primary-foreground">
            W
          </span>
          <span className="hidden sm:inline">Whop Marketplace</span>
        </Link>

        <nav className="flex flex-1 items-center gap-1 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={`${link.label}-${link.href}`}
              href={link.href}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                isActive(pathname, link.href)
                  ? "bg-card text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <PersonaSwitcher />
      </div>
    </header>
  );
}
