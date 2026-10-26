"use client";
import { useState, useEffect, useCallback } from "react";

function getKey(gameId: string, date: string) {
  return `naija-daily:${gameId}:state:${date}`;
}

/**
 * Persists game state in localStorage keyed by game+date.
 * Automatically hydrates from storage on mount.
 */
export function useGameState<T>(
  gameId: string,
  date: string,
  initialState: T
): [T, (updater: T | ((prev: T) => T)) => void] {
  const [state, setStateInternal] = useState<T>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const key = getKey(gameId, date);
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        setStateInternal(JSON.parse(raw) as T);
      }
    } catch {
      // ignore parse errors
    }
    setHydrated(true);
  }, [gameId, date]);

  const setState = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setStateInternal((prev) => {
        const next =
          typeof updater === "function"
            ? (updater as (prev: T) => T)(prev)
            : updater;
        if (hydrated) {
          const key = getKey(gameId, date);
          try {
            localStorage.setItem(key, JSON.stringify(next));
          } catch {
            // storage quota exceeded — silently continue
          }
        }
        return next;
      });
    },
    [gameId, date, hydrated]
  );

  return [state, setState];
}

