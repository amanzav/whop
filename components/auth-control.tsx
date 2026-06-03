"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

/**
 * AuthControl — Sign In when unauthenticated; user identity + Sign Out when
 * authenticated. Rendered in the global header on every page.
 */
export function AuthControl() {
  const { data: session, status } = useSession();
  const users = useStore((s) => s.users);

  if (status !== "authenticated" || !session?.user) {
    return (
      <Button asChild size="sm">
        <Link href="/signin">Sign in</Link>
      </Button>
    );
  }

  const user = users.find((u) => u.id === session.user.id);
  const name = user?.name ?? session.user.name ?? "Account";

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        {user?.avatar && <AvatarImage src={user.avatar} alt={name} />}
        <AvatarFallback className="text-[10px]">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="hidden text-sm font-medium text-foreground md:inline">
        {name}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        <LogOut />
      </Button>
    </div>
  );
}
