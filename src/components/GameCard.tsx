"use client";
import React from "react";
import Link from "next/link";
import type { GameDefinition } from "@/games/types";

interface GameCardProps {
  game: GameDefinition;
  status: "play" | "done" | "coming-soon";
  result?: string;
}

// Nigerian-themed SVG icons for each game mode
function GameIcon({ id }: { id: string }) {
  if (id === "wordle") {
    return (
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-400/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-xl shadow-xs">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="M7 8h10" />
          <path d="M7 12h10" />
          <path d="M7 16h6" />
        </svg>
      </div>
    );
  }
  if (id === "connections") {
    return (
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 font-black text-xl shadow-xs">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      </div>
    );
  }
  if (id === "crossword") {
    return (
      <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-black text-xl">
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18v18H3z" />
          <path d="M3 9h18" />
          <path d="M9 3v18" />
        </svg>
      </div>
    );
  }
  // Word search default
  return (
    <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-black text-xl">
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    </div>
  );
}

export function GameCard({ game, status, result }: GameCardProps) {
  const isLocked = status === "coming-soon" || game.comingSoon;

  const cardContent = (
    <div
      className={`relative flex flex-col justify-between rounded-3xl p-5 min-h-[175px] transition-all select-none border ${
        isLocked
          ? "bg-zinc-50/70 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-800/80 opacity-60 cursor-not-allowed"
          : status === "done"
          ? "bg-gradient-to-b from-emerald-50/90 to-white dark:from-emerald-950/30 dark:to-zinc-900 border-emerald-400 dark:border-emerald-600/80 shadow-md shadow-emerald-700/5 hover:scale-[1.02] active:scale-95 cursor-pointer"
          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-700/10 shadow-xs hover:scale-[1.02] active:scale-95 cursor-pointer"
      }`}
    >
      <div className="flex items-start justify-between">
        <GameIcon id={game.id} />
        {isLocked && (
          <span className="text-[10px] uppercase font-black tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-700">
            Soon
          </span>
        )}
        {status === "done" && (
          <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-600 text-white px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
            <span>✓</span> Done
          </span>
        )}
        {!isLocked && status === "play" && (
          <span className="text-[10px] uppercase font-black tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
            Play
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="font-black text-lg text-zinc-900 dark:text-zinc-100 tracking-tight">
          {game.name}
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5 line-clamp-2 leading-relaxed">
          {game.description}
        </p>
      </div>

      {status === "done" && result && (
        <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <span>Today&apos;s Score</span>
          <span className="font-black">{result}</span>
        </div>
      )}
    </div>
  );

  if (isLocked) {
    return cardContent;
  }

  return (
    <Link href={game.path} className="block no-underline">
      {cardContent}
    </Link>
  );
}
