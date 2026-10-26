"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useStreak } from "@/hooks/useStreak";

export function Header() {
  const { currentStreak, bestStreak, gamesPlayed, gamesWon } = useStreak();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [colorblind, setColorblind] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  useEffect(() => {
    const isCb = localStorage.getItem("naija-daily:colorblind") === "true";
    setColorblind(isCb);
  }, []);

  const toggleColorblind = () => {
    const next = !colorblind;
    setColorblind(next);
    localStorage.setItem("naija-daily:colorblind", String(next));
    document.documentElement.classList.toggle("colorblind", next);
  };

  // Close popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverOpen]);

  return (
    <header className="w-full bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 sticky top-0 z-40">
      <div className="max-w-[1100px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Newspaper serif wordmark */}
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-editorial text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Naija Daily
          </span>
        </Link>

        {/* Right: Streak Chip with Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setPopoverOpen(!popoverOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-800 transition-colors cursor-pointer"
            aria-label="View streaks and stats"
          >
            <span className="text-sm">🔥</span>
            <span className="tabular-nums font-bold">{currentStreak}</span>
          </button>

          {/* Stats Popover */}
          {popoverOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg p-4 shadow-xl z-50 text-xs animate-fadein">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800 pb-2 mb-3">
                <span className="font-editorial font-bold text-sm text-gray-900 dark:text-gray-100">
                  Player Statistics
                </span>
                <button
                  onClick={() => setPopoverOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xs"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center mb-3">
                <div>
                  <p className="text-lg font-bold text-[#15803d] dark:text-emerald-400 tabular-nums">
                    {currentStreak}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">Streak</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {bestStreak}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">Best</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {gamesPlayed}
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">Played</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100 tabular-nums">
                    {winRate}%
                  </p>
                  <p className="text-[10px] text-gray-500 uppercase">Win %</p>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
                <span className="text-[11px] text-gray-600 dark:text-gray-400">
                  Colorblind Mode
                </span>
                <button
                  type="button"
                  onClick={toggleColorblind}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
                    colorblind ? "bg-[#15803d]" : "bg-gray-300 dark:bg-zinc-700"
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      colorblind ? "translate-x-4" : ""
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
