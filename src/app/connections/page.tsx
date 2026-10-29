import React from "react";
import { getTodayInLagos } from "@/lib/dates";
import { getServiceSupabase } from "@/lib/supabaseClient";
import { ConnectionsGame } from "@/games/connections/ConnectionsGame";
import type { ConnectionsPuzzle } from "@/games/connections/connectionsLogic";
import Link from "next/link";

export const metadata = {
  title: "Connections | Naija Daily",
  description: "Group words with Nigerian connections in today's puzzle",
};

export const revalidate = 0;

export default async function ConnectionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ date?: string; preview?: string }>;
}) {
  const sp = searchParams ? await searchParams : {};
  const isPreview = sp.preview === "true";
  const date = sp.date || getTodayInLagos();

  let puzzleData: ConnectionsPuzzle | null = null;

  try {
    const supabase = getServiceSupabase();
    let query = supabase
      .from("puzzles")
      .select("game, puzzle_date, payload, status")
      .eq("game", "connections")
      .eq("puzzle_date", date);

    if (!isPreview) {
      query = query.eq("status", "published");
    }

    const { data } = await query.maybeSingle();
    if (data?.payload) {
      puzzleData = data.payload as ConnectionsPuzzle;
    }
  } catch (err) {
    console.error("Failed to fetch Connections puzzle:", err);
  }

  if (!puzzleData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white dark:bg-zinc-950 text-gray-900 dark:text-gray-100">
        <h1 className="font-editorial text-2xl font-bold mb-2">Today&apos;s puzzle isn&apos;t ready yet</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Check back shortly for today&apos;s Naija Connections challenge!
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return <ConnectionsGame puzzle={puzzleData} />;
}
