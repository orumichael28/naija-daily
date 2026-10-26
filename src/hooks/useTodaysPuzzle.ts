"use client";
import { useState, useEffect } from "react";
import { getTodayInLagos } from "@/lib/dates";

interface PuzzleResult<T> {
  puzzle: T | null;
  loading: boolean;
  error: string | null;
  date: string;
}

export function useTodaysPuzzle<T>(gameId: string): PuzzleResult<T> {
  const date = getTodayInLagos();
  const [puzzle, setPuzzle] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/puzzle/${gameId}/${date}`)
      .then((r) => {
        if (!r.ok) throw new Error("No puzzle available for today");
        return r.json() as Promise<T>;
      })
      .then((data) => {
        if (!cancelled) {
          setPuzzle(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load puzzle");
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [gameId, date]);

  return { puzzle, loading, error, date };
}

