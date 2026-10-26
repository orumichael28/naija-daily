"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useStreak } from "@/hooks/useStreak";
import { games } from "@/games/registry";
import { getTodayInLagos, formatDisplayDate } from "@/lib/dates";
import { AdSlot } from "@/components/AdSlot";

type GameStatus = "play" | "done";

interface GameRowState {
  status: GameStatus;
  result?: string;
}

function getGameStatus(gameId: string, date: string): GameRowState {
  if (typeof window === "undefined") return { status: "play" };
  try {
    const key = `naija-daily:${gameId}:state:${date}`;
    const raw = localStorage.getItem(key);
    if (!raw) return { status: "play" };

    const state = JSON.parse(raw);
    if (state.status === "won" || state.status === "lost") {
      let result: string | undefined;
      if (gameId === "wordle" && state.guesses) {
        result = state.status === "won" ? `${state.guesses.length}/6` : "X/6";
      } else if (gameId === "connections" && typeof state.mistakes === "number") {
        result = state.status === "won" ? `${4 - state.mistakes} left` : "Failed";
      }
      return { status: "done", result };
    }
  } catch {
    // ignore
  }
  return { status: "play" };
}

function GameRow({
  game,
  status,
  result,
}: {
  game: { id: string; name: string; description: string; path: string };
  status: GameStatus;
  result?: string;
}) {
  return (
    <Link
      href={game.path}
      className="group flex items-center justify-between py-4 border-b border-gray-200 dark:border-zinc-800 last:border-b-0 no-underline hover:bg-gray-50 dark:hover:bg-zinc-900/60 -mx-4 px-4 transition-colors"
    >
      <div className="min-w-0">
        <p className="font-editorial font-bold text-base text-gray-900 dark:text-gray-100 leading-tight">
          {game.name}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">
          {game.description}
        </p>
      </div>

      <div className="ml-4 shrink-0">
        {status === "done" ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803d] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md tabular-nums">
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
              <path d="M8.5 2.5 4 7 1.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            {result ?? "Done"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 px-2.5 py-1 rounded-md group-hover:border-[#15803d] group-hover:text-[#15803d] dark:group-hover:border-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            Play
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 2l4 3-4 3V2z" fill="currentColor" stroke="none" />
            </svg>
          </span>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  const { currentStreak } = useStreak();
  const [rowStates, setRowStates] = useState<Record<string, GameRowState>>({});
  const today = getTodayInLagos();

  // Only show live (non-comingSoon) games
  const liveGames = games.filter((g) => !g.comingSoon);

  useEffect(() => {
    const states: Record<string, GameRowState> = {};
    for (const game of liveGames) {
      states[game.id] = getGameStatus(game.id, today);
    }
    setRowStates(states);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [today]);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
      {/* Sticky editorial header */}
      <header className="sticky top-0 z-40 w-full bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800">
        <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-editorial font-bold text-2xl tracking-tight text-gray-900 dark:text-gray-100">
            Naija Daily
          </span>
          <Link
            href="/"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-800 transition-colors"
            aria-label="View stats"
          >
            <span>🔥</span>
            <span className="tabular-nums font-bold">{currentStreak}</span>
          </Link>
        </div>
      </header>

      {/* Main content area */}
      <div className="max-w-[1100px] mx-auto px-4 py-8 lg:flex lg:gap-12 lg:items-start">

        {/* Left: date + game list */}
        <main className="flex-1 max-w-[480px] mx-auto lg:mx-0">
          {/* Date line */}
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
            {formatDisplayDate(today)}
          </p>

          {/* Game rows */}
          <div>
            {liveGames.map((game) => (
              <GameRow
                key={game.id}
                game={game}
                status={rowStates[game.id]?.status ?? "play"}
                result={rowStates[game.id]?.result}
              />
            ))}
          </div>

          {/* Ad slot — renders nothing if unconfigured */}
          <div className="mt-8">
            <AdSlot />
          </div>
        </main>

        {/* Right: sticky ad rail (desktop ≥1024px only) */}
        <aside className="hidden lg:block w-[300px] shrink-0 sticky top-20">
          <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-gray-50 dark:bg-zinc-900 flex items-center justify-center text-xs text-gray-400 dark:text-zinc-600"
            style={{ minHeight: "250px" }}>
            <span>Ad Space</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
