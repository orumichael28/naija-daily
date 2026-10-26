"use client";
import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ConnectionsGroup,
  ConnectionsPuzzle,
  shuffleTiles,
  checkSelection,
  isOneAway,
} from "./connectionsLogic";
import { ConnectionsTile } from "./ConnectionsTile";
import { useGameState } from "@/hooks/useGameState";
import { useStreak } from "@/hooks/useStreak";

interface ConnectionsGameProps {
  puzzle: ConnectionsPuzzle;
}

interface ConnectionsState {
  tileOrder: string[];
  selected: string[];
  solvedGroupIds: number[];
  mistakes: number;
  status: "playing" | "won" | "lost";
}

const COLOR_CLASSES: Record<string, string> = {
  yellow: "bg-yellow-400 dark:bg-yellow-500 text-gray-900",
  green: "bg-green-600 text-white",
  blue: "bg-blue-600 text-white",
  purple: "bg-purple-600 text-white",
};

export function ConnectionsGame({ puzzle }: ConnectionsGameProps) {
  const initialTiles = useMemo(() => {
    const allWords = puzzle.groups.flatMap((g) => g.words);
    return shuffleTiles(allWords);
  }, [puzzle]);

  const initialState: ConnectionsState = {
    tileOrder: initialTiles,
    selected: [],
    solvedGroupIds: [],
    mistakes: 0,
    status: "playing",
  };

  const [gameState, setGameState] = useGameState<ConnectionsState>(
    "connections",
    puzzle.date,
    initialState
  );

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);

  const { currentStreak, markGameCompleted, markGameWon } = useStreak();

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Groups lookup
  const groupMap = useMemo(() => {
    const map = new Map<number, ConnectionsGroup>();
    puzzle.groups.forEach((g) => map.set(g.id, g));
    return map;
  }, [puzzle.groups]);

  // Words that are still unsolved
  const unsolvedWords = useMemo(() => {
    const solvedWords = new Set<string>();
    gameState.solvedGroupIds.forEach((id) => {
      const g = groupMap.get(id);
      if (g) g.words.forEach((w) => solvedWords.add(w.toUpperCase()));
    });

    return (gameState.tileOrder.length ? gameState.tileOrder : initialTiles).filter(
      (w) => !solvedWords.has(w.toUpperCase())
    );
  }, [gameState.solvedGroupIds, gameState.tileOrder, initialTiles, groupMap]);

  const handleTileClick = (word: string) => {
    if (gameState.status !== "playing") return;

    if (gameState.selected.includes(word)) {
      setGameState((prev) => ({
        ...prev,
        selected: prev.selected.filter((w) => w !== word),
      }));
    } else {
      if (gameState.selected.length >= 4) return;
      setGameState((prev) => ({
        ...prev,
        selected: [...prev.selected, word],
      }));
    }
  };

  const handleShuffle = () => {
    const shuffled = shuffleTiles(unsolvedWords);
    setGameState((prev) => ({
      ...prev,
      tileOrder: shuffled,
    }));
  };

  const handleDeselectAll = () => {
    setGameState((prev) => ({
      ...prev,
      selected: [],
    }));
  };

  const handleSubmit = useCallback(() => {
    if (gameState.status !== "playing" || gameState.selected.length !== 4) return;

    const matchedGroup = checkSelection(
      gameState.selected,
      puzzle.groups,
      gameState.solvedGroupIds
    );

    if (matchedGroup) {
      const newSolved = [...gameState.solvedGroupIds, matchedGroup.id];
      const isWon = newSolved.length === puzzle.groups.length;

      setGameState((prev) => ({
        ...prev,
        solvedGroupIds: newSolved,
        selected: [],
        status: isWon ? "won" : "playing",
      }));

      if (isWon) {
        markGameWon();
        markGameCompleted();
        setTimeout(() => setShowResultModal(true), 600);
      }
    } else {
      // Mistake
      const newMistakes = gameState.mistakes + 1;
      const oneAway = isOneAway(
        gameState.selected,
        puzzle.groups,
        gameState.solvedGroupIds
      );

      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (oneAway) {
        showToast("One away...!");
      }

      if (newMistakes >= 4) {
        setGameState((prev) => ({
          ...prev,
          mistakes: newMistakes,
          status: "lost",
          selected: [],
        }));
        markGameCompleted();
        setTimeout(() => setShowResultModal(true), 600);
      } else {
        setGameState((prev) => ({
          ...prev,
          mistakes: newMistakes,
        }));
      }
    }
  }, [gameState, puzzle.groups, markGameCompleted, markGameWon, setGameState]);

  const handleShare = async () => {
    const isWon = gameState.status === "won";
    const header = `Naija Daily Connections (${puzzle.date})\nMistakes: ${gameState.mistakes}/4`;
    const streakStr = currentStreak > 0 ? `\n🔥 Streak: ${currentStreak}` : "";
    const text = `${header}${streakStr}\nPlay at: https://naijadaily.com`;

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full px-3 py-4 justify-between">
      {/* Top Bar */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-2">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-500 hover:text-green-700 dark:hover:text-green-400 flex items-center gap-1"
        >
          ← Home
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-green-700 dark:text-green-400">
            Connections
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Group words with Nigerian connections
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowResultModal(true)}
          className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md"
        >
          Status
        </button>
      </header>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-xl">
          {toastMessage}
        </div>
      )}

      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col justify-center gap-2.5 my-2">
        {/* Solved Banners */}
        {gameState.solvedGroupIds.map((id) => {
          const group = groupMap.get(id);
          if (!group) return null;
          return (
            <div
              key={id}
              className={`rounded-xl p-3.5 text-center flex flex-col items-center justify-center transition-all animate-fadein ${
                COLOR_CLASSES[group.color] || "bg-green-600 text-white"
              }`}
            >
              <p className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                {group.label}
              </p>
              <p className="text-xs font-semibold mt-0.5 opacity-90">
                {group.words.join(", ")}
              </p>
            </div>
          );
        })}

        {/* If lost, reveal remaining unsolved groups */}
        {gameState.status === "lost" &&
          puzzle.groups
            .filter((g) => !gameState.solvedGroupIds.includes(g.id))
            .map((group) => (
              <div
                key={group.id}
                className={`rounded-xl p-3.5 text-center flex flex-col items-center justify-center opacity-80 ${
                  COLOR_CLASSES[group.color] || "bg-gray-700 text-white"
                }`}
              >
                <p className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                  {group.label}
                </p>
                <p className="text-xs font-semibold mt-0.5 opacity-90">
                  {group.words.join(", ")}
                </p>
              </div>
            ))}

        {/* Unsolved Tiles 4x4 */}
        {gameState.status !== "lost" && (
          <div
            className={`grid grid-cols-4 gap-2 ${
              isShaking ? "animate-shake" : ""
            }`}
          >
            {unsolvedWords.map((word) => (
              <ConnectionsTile
                key={word}
                word={word}
                selected={gameState.selected.includes(word)}
                onClick={() => handleTileClick(word)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Controls & Mistakes */}
      <div className="mt-auto pt-2 flex flex-col gap-4">
        {/* Mistake bubbles */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Mistakes remaining:
          </span>
          <div className="flex gap-1.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  idx < 4 - gameState.mistakes
                    ? "bg-gray-700 dark:bg-gray-300"
                    : "bg-gray-300 dark:bg-gray-700 opacity-30"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={handleShuffle}
            disabled={gameState.status !== "playing"}
            className="flex-1 py-3 px-3 rounded-full border border-gray-300 dark:border-gray-700 font-bold text-xs uppercase hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
          >
            Shuffle
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            disabled={gameState.status !== "playing" || gameState.selected.length === 0}
            className="flex-1 py-3 px-3 rounded-full border border-gray-300 dark:border-gray-700 font-bold text-xs uppercase hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40"
          >
            Deselect
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={gameState.status !== "playing" || gameState.selected.length !== 4}
            className="flex-1 py-3 px-3 rounded-full bg-green-700 text-white font-bold text-xs uppercase hover:bg-green-800 disabled:opacity-40 cursor-pointer shadow-md"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadein">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl relative">
            <button
              onClick={() => setShowResultModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800"
            >
              ✕
            </button>

            <div className="text-4xl mb-2">
              {gameState.status === "won" ? "🇳🇬" : "💔"}
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1">
              {gameState.status === "won" ? "Omo You Try Well!" : "Game Over O!"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest font-semibold">
              {gameState.status === "won"
                ? `Finished with ${4 - gameState.mistakes} mistakes to spare`
                : "Better luck tomorrow!"}
            </p>

            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3.5 px-4 bg-green-700 hover:bg-green-800 active:scale-98 text-white font-bold rounded-xl shadow-lg transition-transform flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{copied ? "Copied to Clipboard!" : "Share Result 📤"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

