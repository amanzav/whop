"use client";

import { useEffect, useState } from "react";

/**
 * Returns true once the component has mounted on the client. Used to avoid
 * hydration mismatches when reading persisted (localStorage-backed) store
 * state that differs from the server-rendered default.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
