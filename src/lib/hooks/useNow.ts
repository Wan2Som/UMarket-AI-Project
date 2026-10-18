"use client";

import { useEffect, useState } from "react";

/**
 * Current time that re-renders every `intervalMs`. Drives the TTL filter:
 * an expired food pre-order or ticket disappears from the feed on the next
 * tick, without a reload. Starts at 0 on the server to avoid hydration drift.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}
