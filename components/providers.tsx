"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

import { useStore } from "@/lib/store";

/** Keeps the Zustand currentUserId in sync with the NextAuth session. */
function AuthSync() {
  const { data: session } = useSession();
  const setCurrentUser = useStore((s) => s.setCurrentUser);

  useEffect(() => {
    setCurrentUser(session?.user?.id ?? null);
  }, [session?.user?.id, setCurrentUser]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthSync />
      {children}
    </SessionProvider>
  );
}
