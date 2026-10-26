"use client";
import React, { useState } from "react";
import type { GuessResult } from "./wordleLogic";

interface WordleModalProps {
  status: "won" | "lost";
  answer: string;
  hint: string;
  guesses: string[];
  results: GuessResult[];
  streak: number;
  date: string;
  onClose: () => void;
}

export function WordleModal({
  status,
  answer,
  hint,
  guesses,
  results,
  streak,
  date,
  onClose,
}: WordleModalProps) {
  const [copied, setCopied] = useState(false);

  const won = status === "won";

  const getShareText = () => {
    const title = `Naija Daily Wordle (${date}) - ${won ? `${guesses.length}/6` : "X/6"}`;
    const grid = results
      .map((row) =>
        row
          .map((state) => {
            if (state === "correct") return "🟩";
            if (state === "present") return "🟨";
            return "⬛";
          })
          .join("")
      )
      .join("\n");
    const streakLine = streak > 0 ? `🔥 Streak: ${streak}` : "";
    return `${title}\n\n${grid}\n\n${streakLine}\nPlay at: https://naijadaily.com`.trim();
  };

  const handleShare = async () => {
    const text = getShareText();
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadein">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
        >
          ✕
        </button>

        <div className="text-4xl mb-2">{won ? "🎉" : "😔"}</div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
          {won ? "Splendid! You Sabi!" : "Hard Luck O!"}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest font-semibold">
          {won ? `Solved in ${guesses.length}/6 tries` : "Better luck tomorrow!"}
        </p>

        <div className="bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-2xl p-4 mb-5">
          <p className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wider">
            Today&apos;s Naija Word
          </p>
          <p className="text-3xl font-black text-green-800 dark:text-green-300 uppercase tracking-widest my-1">
            {answer}
          </p>
          <p className="text-xs text-green-700 dark:text-green-400 italic">
            &ldquo;{hint}&rdquo;
          </p>
        </div>

        {streak > 0 && (
          <div className="flex items-center justify-center gap-1.5 text-orange-600 dark:text-orange-400 font-bold mb-4">
            <span>🔥</span>
            <span>Current Streak: {streak} day{streak > 1 ? "s" : ""}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleShare}
          className="w-full py-3.5 px-4 bg-green-700 hover:bg-green-800 active:scale-98 text-white font-bold rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{copied ? "Copied to Clipboard!" : "Share Result 📤"}</span>
        </button>
      </div>
    </div>
  );
}

