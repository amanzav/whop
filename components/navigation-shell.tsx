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

        <RoleContextSwitcher />
        <AuthControl />
      </div>
    </header>
  );
}
