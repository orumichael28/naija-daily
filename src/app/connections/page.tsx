import React from "react";
import fs from "fs";
import path from "path";
import { getTodayInLagos } from "@/lib/dates";
import { ConnectionsGame } from "@/games/connections/ConnectionsGame";
import type { ConnectionsPuzzle } from "@/games/connections/connectionsLogic";
import Link from "next/link";

export const metadata = {
  title: "Connections | Naija Daily",
  description: "Group words with Nigerian connections in today's puzzle",
};

export default function ConnectionsPage() {
  const date = getTodayInLagos();
  const filePath = path.join(process.cwd(), "puzzles", "connections", `${date}.json`);

  let puzzleData: ConnectionsPuzzle | null = null;
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
        <h1 className="text-2xl font-bold mb-2">No Connections Puzzle Today</h1>
        <p className="text-gray-500 mb-4">Please check back tomorrow for a new Naija Connections puzzle!</p>
        <Link href="/" className="px-4 py-2 bg-green-700 text-white font-semibold rounded-lg">
          Back to Home
        </Link>
      </div>
    );
  }

  return <ConnectionsGame puzzle={puzzleData} />;
}

