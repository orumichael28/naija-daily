"use client";
import React from "react";
import type { LetterState } from "./wordleLogic";

interface WordleKeyboardProps {
  keyboardState: Record<string, LetterState>;
  onKey: (key: string) => void;
}

const ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "DEL"],
];

/**
 * Returns inline style based on letter state, driven by CSS custom properties
 * (--tile-correct, --tile-present, --tile-absent) so colorblind mode works automatically.
 */
function keyStyle(state: LetterState | undefined): React.CSSProperties {
  if (state === "correct") {
    return { backgroundColor: "var(--tile-correct)", color: "#ffffff" };
  }
  if (state === "present") {
    return { backgroundColor: "var(--tile-present)", color: "#ffffff" };
  }
  if (state === "absent") {
    return { backgroundColor: "var(--tile-absent)", color: "#ffffff", opacity: 0.7 };
  }
  return {};
}

export function WordleKeyboard({ keyboardState, onKey }: WordleKeyboardProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full max-w-lg mx-auto px-1 select-none">
      {ROWS.map((row, rIdx) => (
        <div key={rIdx} className="flex gap-1 justify-center w-full">
          {row.map((key) => {
            const isWide = key === "ENTER" || key === "DEL";
            const state = keyboardState[key];
            const hasState = state === "correct" || state === "present" || state === "absent";

            return (
              <button
                key={key}
                type="button"
                onClick={() => onKey(key)}
                className={`h-13 sm:h-14 font-bold text-sm sm:text-base rounded-md flex items-center justify-center transition-colors shadow-sm cursor-pointer ${
                  isWide ? "px-2.5 sm:px-4 text-xs sm:text-sm flex-[1.4]" : "flex-1"
                } ${
                  hasState
                    ? ""
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 active:bg-gray-300 dark:active:bg-gray-600"
                }`}
                style={hasState ? keyStyle(state) : {}}
              >
                {key === "DEL" ? "⌫" : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
