"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns false during SSR and the first client render (matching server HTML),
 * then true after hydration. Avoids hydration mismatches for persisted state.
 */
const subscribe = () => () => {};

export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true, // client snapshot
    () => false // server snapshot
  );
}
