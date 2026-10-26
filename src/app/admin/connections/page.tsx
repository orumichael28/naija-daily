"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

const DIFFICULTIES = ["yellow", "green", "blue", "purple"] as const;
type Difficulty = (typeof DIFFICULTIES)[number];

interface GroupForm {
  id: number;
  label: string;
  words: [string, string, string, string];
  color: Difficulty;
}

interface PuzzleRow {
  id: string;
  puzzle_date: string;
  status: "draft" | "published";
  payload: { groups: GroupForm[] };
}

function emptyGroup(id: number, color: Difficulty): GroupForm {
  return { id, label: "", words: ["", "", "", ""], color };
}

function defaultGroups(): GroupForm[] {
  return DIFFICULTIES.map((c, i) => emptyGroup(i, c));
}

function validateGroups(groups: GroupForm[], date: string): string[] {
  const errors: string[] = [];
  if (!date) errors.push("Date is required");

  const seenWords = new Set<string>();
  for (const g of groups) {
    if (!g.label.trim()) errors.push(`Category name is required for ${g.color} group`);
    for (const w of g.words) {
      if (!w.trim()) errors.push(`All 4 words in the ${g.color} group are required`);
      else if (seenWords.has(w.toLowerCase())) {
        errors.push(`Duplicate word: "${w}" appears in multiple groups`);
      }
      seenWords.add(w.toLowerCase());
    }
  }
  const colors = groups.map((g) => g.color);
  const uniqueColors = new Set(colors);
  if (uniqueColors.size !== 4) errors.push("Each group must have a unique difficulty color");

  return errors;
}

export default function ConnectionsAdminPage() {
  const [puzzles, setPuzzles] = useState<PuzzleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [groups, setGroups] = useState<GroupForm[]>(defaultGroups());

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchPuzzles() {
    setLoading(true);
    const res = await fetch("/api/admin/puzzles?game=connections");
    if (res.ok) setPuzzles(await res.json());
    setLoading(false);
  }

  useEffect(() => { fetchPuzzles(); }, []);

  function resetForm() {
    setEditingId(null);
    setDate("");
    setGroups(defaultGroups());
    setErrors([]);
  }

  function startEdit(p: PuzzleRow) {
    setEditingId(p.id);
    setDate(p.puzzle_date);
    setGroups(
      p.payload.groups.map((g, i) => ({
        id: i,
        label: g.label,
        words: g.words as [string, string, string, string],
        color: g.color as Difficulty,
      }))
    );
    setErrors([]);
  }

  function updateGroup(idx: number, field: "label" | "color", value: string) {
    setGroups((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }

  function updateWord(groupIdx: number, wordIdx: number, value: string) {
    setGroups((prev) => {
      const next = [...prev];
      const words = [...next[groupIdx].words] as [string, string, string, string];
      words[wordIdx] = value;
      next[groupIdx] = { ...next[groupIdx], words };
      return next;
    });
  }

  async function handleSave(publishNow?: boolean) {
    const errs = validateGroups(groups, date);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    setSaving(true);

    const body = {
      id: editingId,
      game: "connections",
      puzzle_date: date,
      payload: { groups: groups.map((g, i) => ({ ...g, id: i })) },
      status: publishNow ? "published" : "draft",
    };

    const res = await fetch("/api/admin/puzzles", {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      showToast(publishNow ? "Published!" : "Saved as draft");
      resetForm();
      fetchPuzzles();
    } else {
      const data = await res.json();
      setErrors([data.error || "Save failed"]);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this puzzle?")) return;
    await fetch(`/api/admin/puzzles?id=${id}`, { method: "DELETE" });
    fetchPuzzles();
  }

  async function handleToggleStatus(p: PuzzleRow) {
    const newStatus = p.status === "published" ? "draft" : "published";
    await fetch("/api/admin/puzzles", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: p.id, status: newStatus }),
    });
    fetchPuzzles();
  }

  const colorDot: Record<Difficulty, string> = {
    yellow: "bg-yellow-400",
    green: "bg-green-600",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
  };

  return (
    <div className="max-w-4xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-editorial text-2xl font-bold text-gray-900 dark:text-gray-100">
            Connections Puzzles
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage daily 4-group puzzles
          </p>
        </div>
        <Link href="/admin" className="text-sm text-[#15803d] hover:underline">
          ← Calendar
        </Link>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {editingId ? "Edit Puzzle" : "New Puzzle"}
        </h2>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48 px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#15803d]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {groups.map((g, gi) => (
            <div
              key={gi}
              className="border border-gray-200 dark:border-zinc-700 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${colorDot[g.color]}`} />
                <select
                  value={g.color}
                  onChange={(e) => updateGroup(gi, "color", e.target.value)}
                  className="text-xs font-semibold bg-transparent border-none focus:outline-none text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                placeholder="Category name"
                value={g.label}
                onChange={(e) => updateGroup(gi, "label", e.target.value)}
                className="w-full px-2 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#15803d] mb-2"
              />

              <div className="grid grid-cols-2 gap-1.5">
                {g.words.map((w, wi) => (
                  <input
                    key={wi}
                    type="text"
                    placeholder={`Word ${wi + 1}`}
                    value={w}
                    onChange={(e) => updateWord(gi, wi, e.target.value)}
                    className="px-2 py-1.5 border border-gray-200 dark:border-zinc-700 rounded-md text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#15803d] uppercase"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg">
            <ul className="text-xs text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
              {errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 dark:border-zinc-700 text-sm font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving…" : "Publish"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : puzzles.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No puzzles yet</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Groups</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {puzzles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium tabular-nums">{p.puzzle_date}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                    {p.payload.groups?.map((g) => g.label).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(p)}
                      className={`text-[10px] font-semibold uppercase tracking-wider border px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                        p.status === "published"
                          ? "bg-emerald-50 text-[#15803d] border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-emerald-50 hover:text-[#15803d] hover:border-emerald-200"
                      }`}
                    >
                      {p.status}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3 text-xs font-semibold">
                      <button type="button" onClick={() => startEdit(p)} className="text-[#15803d] hover:underline cursor-pointer">Edit</button>
                      <a href={`/connections?preview=true&date=${p.puzzle_date}`} target="_blank" rel="noreferrer" className="text-gray-500 hover:underline">Preview</a>
                      <button type="button" onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline cursor-pointer">Delete</button>
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

