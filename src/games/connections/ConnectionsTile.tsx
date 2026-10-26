"use client";
import React from "react";

interface ConnectionsTileProps {
  word: string;
  selected: boolean;
  onClick: () => void;
}

export function ConnectionsTile({ word, selected, onClick }: ConnectionsTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-16 sm:h-20 p-1 sm:p-2 rounded-xl font-extrabold text-xs sm:text-sm tracking-wide uppercase transition-all flex items-center justify-center text-center cursor-pointer select-none active:scale-95 ${
        selected
          ? "bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 ring-2 ring-green-600 scale-[1.02]"
          : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 shadow-sm"
      }`}
    >
      <span className="break-words line-clamp-2">{word}</span>
    </button>
  );
}

