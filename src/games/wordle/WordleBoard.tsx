"use client";
import React from "react";
import type { GuessResult } from "./wordleLogic";

interface WordleBoardProps {
  guesses: string[];
  results: GuessResult[];
  currentGuess: string;
  maxGuesses?: number;
  wordLength?: number;
}

/**
 * Tile style driven by CSS custom properties (--tile-correct, --tile-present, --tile-absent).
 * This ensures colorblind mode (set via .colorblind on <html>) works automatically.
 */
function tileStyle(status: string | null): React.CSSProperties {
  if (status === "correct") {
    return {
      backgroundColor: "var(--tile-correct)",
      borderColor: "var(--tile-correct)",
      color: "#ffffff",
    };
  }
  if (status === "present") {
    return {
      backgroundColor: "var(--tile-present)",
      borderColor: "var(--tile-present)",
      color: "#ffffff",
    };
  }
  if (status === "absent") {
    return {
      backgroundColor: "var(--tile-absent)",
      borderColor: "var(--tile-absent)",
      color: "#ffffff",
    };
  }
  return {};
}

export function WordleBoard({
  guesses,
  results,
  currentGuess,
  maxGuesses = 6,
  wordLength = 5,
}: WordleBoardProps) {
  const rows = [];

  for (let i = 0; i < maxGuesses; i++) {
    const isCommitted = i < guesses.length;
    const isCurrent = i === guesses.length;
    const guessWord = isCommitted
      ? guesses[i].toUpperCase()
      : isCurrent
      ? currentGuess.toUpperCase()
      : "";
    const rowResult = isCommitted ? results[i] : null;

    rows.push(
      <div key={i} className="flex gap-1.5 justify-center">
        {Array.from({ length: wordLength }).map((_, c) => {
          const char = guessWord[c] || "";
          const status = rowResult ? rowResult[c] : null;

          // Base border style (empty / pending)
          let baseClass =
            "border-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100";
          if (!status && char) {
            baseClass =
              "border-2 border-gray-600 dark:border-gray-400 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100";
          }

          return (
            <div
              key={c}
              className={`w-12 h-12 sm:w-14 sm:h-14 font-black text-2xl flex items-center justify-center rounded-lg uppercase select-none transition-all duration-300 ${
                status ? "" : baseClass
              }`}
              style={status ? tileStyle(status) : {}}
            >
              {char}
            </div>
          );
        })}
      </div>
    );
  }

  return <div className="flex flex-col gap-1.5 my-auto">{rows}</div>;
}
