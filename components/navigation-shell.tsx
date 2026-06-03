"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import type { Role } from "@/lib/types";
import { AuthControl } from "@/components/auth-control";
import { RoleContextSwitcher } from "@/components/role-context-switcher";

interface NavLink {
  label: string;
  href: string;
}

const GUEST_LINKS: NavLink[] = [
  { label: "Browse Gigs", href: "/" },
  { label: "Task Board", href: "/tasks" },
];

const LINKS_BY_ROLE: Record<Role, NavLink[]> = {
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
  const { status } = useSession();
  const role = useStore((s) => s.role);
  const pathname = usePathname();

  const authenticated = status === "authenticated";
  const links = authenticated ? LINKS_BY_ROLE[role] : GUEST_LINKS;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-5 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-full font-semibold tracking-tight outline-none transition-opacity hover:opacity-90 focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="grid size-6 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            W
          </span>
          <span className="hidden sm:inline">Whop Marketplace</span>
        </Link>

        <nav className="flex flex-1 items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={`${link.label}-${link.href}`}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <RoleContextSwitcher />
          <AuthControl />
        </div>
      </div>
    </header>
  );
}
