"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Smart polling hook — fetches a URL every `intervalMs`, but only triggers
 * a state update when the response data has actually changed.
 * Uses a simple JSON hash comparison to avoid unnecessary re-renders.
 */
export function useSmartPoll<T>(
  url: string,
  intervalMs: number = 10000,
  transform?: (data: unknown) => T
): { data: T | null; loading: boolean; error: string | null; lastUpdated: Date | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hashRef = useRef<string>("");
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isInitial: boolean) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const raw = await res.json();

      // Simple hash: stringify and compare
      const hash = JSON.stringify(raw);
      if (hash === hashRef.current) {
        // No change — skip update
        if (isInitial) setLoading(false);
        return;
      }

      hashRef.current = hash;
      if (!mountedRef.current) return;

      const transformed = transform ? transform(raw) : (raw as T);
      setData(transformed);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : "Fetch failed");
      }
    } finally {
      if (mountedRef.current && isInitial) {
        setLoading(false);
      }
    }
  }, [url, transform]);

  useEffect(() => {
    mountedRef.current = true;
    fetchData(true);
    const id = setInterval(() => fetchData(false), intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { data, loading, error, lastUpdated };
}
