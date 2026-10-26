"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PuzzleRow {
  id: string;
  puzzle_date: string;
  status: "draft" | "published";
  payload: { answer: string; hint: string };
}

interface ValidationError {
  field: string;
  message: string;
}

function validate(answer: string, date: string): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!answer) errors.push({ field: "answer", message: "Answer is required" });
  else if (!/^[a-zA-Z]{5}$/.test(answer))
    errors.push({ field: "answer", message: "Answer must be exactly 5 letters (a–z only)" });
  if (!date) errors.push({ field: "date", message: "Date is required" });
  return errors;
}

export default function WordleAdminPage() {
  const [puzzles, setPuzzles] = useState<PuzzleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [date, setDate] = useState("");
  const [answer, setAnswer] = useState("");
  const [hint, setHint] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  async function fetchPuzzles() {
    setLoading(true);
    const res = await fetch("/api/admin/puzzles?game=wordle");
    if (res.ok) {
      setPuzzles(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPuzzles();
  }, []);

  function resetForm() {
    setEditingId(null);
    setDate("");
    setAnswer("");
    setHint("");
    setValidationErrors([]);
    setError(null);
  }

  function startEdit(p: PuzzleRow) {
    setEditingId(p.id);
    setDate(p.puzzle_date);
    setAnswer(p.payload.answer);
    setHint(p.payload.hint || "");
    setValidationErrors([]);
    setError(null);
  }

  async function handleSave(publishNow?: boolean) {
    const errs = validate(answer, date);
    if (errs.length) { setValidationErrors(errs); return; }
    setValidationErrors([]);
    setSaving(true);

    const body = {
      id: editingId,
      game: "wordle",
      puzzle_date: date,
      payload: { answer: answer.toLowerCase(), hint },
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
      setError(data.error || "Save failed");
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

  function handleDuplicate(p: PuzzleRow) {
    setEditingId(null);
    setDate("");
    setAnswer(p.payload.answer);
    setHint(p.payload.hint || "");
  }

  const fieldError = (field: string) =>
    validationErrors.find((e) => e.field === field)?.message;

  return (
    <div className="max-w-3xl">
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-editorial text-2xl font-bold text-gray-900 dark:text-gray-100">
            Wordle Puzzles
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage daily 5-letter answer puzzles
          </p>
        </div>
        <Link href="/admin" className="text-sm text-[#15803d] hover:underline">
          ← Calendar
        </Link>
      </div>

      {/* Editor form */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-8">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {editingId ? "Edit Puzzle" : "New Puzzle"}
        </h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#15803d]"
            />
            {fieldError("date") && (
              <p className="text-xs text-red-600 mt-1">{fieldError("date")}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Answer (5 letters)
            </label>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value.toLowerCase())}
              maxLength={5}
              placeholder="e.g. lagos"
              className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#15803d] font-mono uppercase"
            />
            {fieldError("answer") && (
              <p className="text-xs text-red-600 mt-1">{fieldError("answer")}</p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
            Hint / Clue
          </label>
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="e.g. Nigeria's largest city"
            className="w-full px-3 py-2 border border-gray-300 dark:border-zinc-700 rounded-lg text-sm bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#15803d]"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 mb-4">{error}</p>
        )}

        <div className="flex gap-2 flex-wrap">
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
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Puzzle list */}
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
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Answer</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
              {puzzles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900/50">
                  <td className="px-4 py-3 font-medium tabular-nums">{p.puzzle_date}</td>
                  <td className="px-4 py-3 font-mono uppercase font-bold text-[#15803d]">
                    {p.payload.answer}
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
                      <button type="button" onClick={() => startEdit(p)} className="text-[#15803d] hover:underline cursor-pointer">
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDuplicate(p)} className="text-gray-500 hover:underline cursor-pointer">
                        Dup
                      </button>
                      <a
                        href={`/wordle?preview=true&date=${p.puzzle_date}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-500 hover:underline"
                      >
                        Preview
                      </a>
                      <button type="button" onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline cursor-pointer">
                        Delete
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

