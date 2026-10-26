"use client";
import React, { useState, useEffect } from "react";

interface RejectedGuess {
  word: string;
  count: number;
  last_seen: string;
}

export default function RejectedWordsPage() {
  const [guesses, setGuesses] = useState<RejectedGuess[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  async function fetchGuesses() {
    setLoading(true);
    const res = await fetch("/api/admin/rejected-guesses");
    if (res.ok) setGuesses(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchGuesses(); }, []);

  async function handleApprove(word: string) {
    const res = await fetch("/api/admin/rejected-guesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve", word }),
    });
    if (res.ok) {
      showToast(`"${word}" approved and added to word list`);
      fetchGuesses();
    }
  }

  async function handleDismiss(word: string) {
    const res = await fetch("/api/admin/rejected-guesses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dismiss", word }),
    });
    if (res.ok) {
      showToast(`"${word}" dismissed`);
      fetchGuesses();
    }
  }

  return (
    <div className="max-w-2xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-xl">
          {toast}
        </div>
      )}

      <div className="mb-6">
        <h1 className="font-editorial text-2xl font-bold text-gray-900 dark:text-gray-100">
          Rejected Guesses
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Words players tried that weren't in the word list. Sorted by frequency.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : guesses.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No rejected guesses yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Word</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Count</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Seen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {guesses.map((g) => (
                <tr key={g.word} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-mono font-bold uppercase text-gray-900 dark:text-gray-100">
                    {g.word}
                  </td>
                  <td className="px-4 py-3 tabular-nums font-semibold text-gray-700 dark:text-gray-300">
                    {g.count}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                    {new Date(g.last_seen).toLocaleDateString("en-NG")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => handleApprove(g.word)}
                        className="text-[#15803d] hover:underline cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismiss(g.word)}
                        className="text-red-500 hover:underline cursor-pointer"
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

