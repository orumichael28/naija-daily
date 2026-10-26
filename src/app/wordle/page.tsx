import React from "react";
import fs from "fs";
import path from "path";
import { getTodayInLagos } from "@/lib/dates";
import { WordleGame } from "@/games/wordle/WordleGame";
import Link from "next/link";

interface WordlePuzzleData {
  date: string;
  answer: string;
  hint: string;
}

export const metadata = {
  title: "Wordle | Naija Daily",
  description: "Play today's 5-letter Nigerian Wordle puzzle",
};

export default function WordlePage() {
  const date = getTodayInLagos();
  const filePath = path.join(process.cwd(), "puzzles", "wordle", `${date}.json`);

  let puzzleData: WordlePuzzleData | null = null;
  if (fs.existsSync(filePath)) {
    try {
      puzzleData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch {
      puzzleData = null;
    }
  }

  if (!puzzleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">No Puzzle Found for Today</h1>
        <p className="text-gray-500 mb-4">Please check back tomorrow for a new Naija Wordle puzzle!</p>
        <Link href="/" className="px-4 py-2 bg-green-700 text-white font-semibold rounded-lg">
          Back to Home
        </Link>
      </div>
    );
  }

  return <WordleGame puzzle={puzzleData} />;
}

