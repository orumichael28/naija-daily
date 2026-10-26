import React from "react";
import { getServiceSupabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { addDays, format } from "@/lib/dates";

const GAMES = ["wordle", "connections"] as const;
const DAYS_AHEAD = 30;

type PuzzleStatus = "missing" | "draft" | "published";

interface DayStatus {
  date: string;
  wordle: PuzzleStatus;
  connections: PuzzleStatus;
}

async function getCalendar(): Promise<DayStatus[]> {
  const supabase = getServiceSupabase();

  const today = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos" })
  );
  const startDate = format(today, "yyyy-MM-dd");
  const endDate = format(addDays(today, DAYS_AHEAD - 1), "yyyy-MM-dd");

  const { data: puzzles } = await supabase
    .from("puzzles")
    .select("game, puzzle_date, status")
    .gte("puzzle_date", startDate)
    .lte("puzzle_date", endDate);

  const puzzleMap = new Map<string, PuzzleStatus>();
  if (puzzles) {
    for (const p of puzzles) {
      puzzleMap.set(`${p.game}:${p.puzzle_date}`, p.status as PuzzleStatus);
    }
  }

  const days: DayStatus[] = [];
  for (let i = 0; i < DAYS_AHEAD; i++) {
    const d = addDays(today, i);
    const dateStr = format(d, "yyyy-MM-dd");
    days.push({
      date: dateStr,
      wordle: puzzleMap.get(`wordle:${dateStr}`) ?? "missing",
      connections: puzzleMap.get(`connections:${dateStr}`) ?? "missing",
    });
  }
  return days;
}

function StatusBadge({ status }: { status: PuzzleStatus }) {
  const styles = {
    missing: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    draft: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    published: "bg-emerald-50 dark:bg-emerald-950/30 text-[#15803d] dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
  };
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-wider border px-2 py-0.5 rounded-md ${styles[status]}`}>
      {status}
    </span>
  );
}

export default async function AdminCalendarPage() {
  const calendar = await getCalendar();

  const wordleMissing = calendar.filter((d) => d.wordle !== "published").length;
  const connectionsMissing = calendar.filter((d) => d.connections !== "published").length;
  const showWarning = wordleMissing > (DAYS_AHEAD - 7) || connectionsMissing > (DAYS_AHEAD - 7);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-editorial text-2xl font-bold text-gray-900 dark:text-gray-100">
            Puzzle Calendar
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Next {DAYS_AHEAD} days
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/wordle"
            className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Wordle
          </Link>
          <Link
            href="/admin/connections"
            className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            + Connections
          </Link>
        </div>
      </div>

      {showWarning && (
        <div className="mb-6 border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 text-sm text-yellow-800 dark:text-yellow-300">
          ⚠️ <strong>Warning:</strong> Fewer than 7 days are fully queued. Add more puzzles soon!
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Wordle
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Connections
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
            {calendar.map((day) => (
              <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 tabular-nums">
                  {day.date}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={day.wordle} />
                    {day.wordle !== "missing" && (
                      <Link
                        href={`/admin/wordle?date=${day.date}`}
                        className="text-xs text-[#15803d] hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={day.connections} />
                    {day.connections !== "missing" && (
                      <Link
                        href={`/admin/connections?date=${day.date}`}
                        className="text-xs text-[#15803d] hover:underline"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

