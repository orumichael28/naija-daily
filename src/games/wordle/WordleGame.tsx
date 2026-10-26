"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { WordleBoard } from "./WordleBoard";
import { WordleKeyboard } from "./WordleKeyboard";
import { WordleModal } from "./WordleModal";
import { checkGuess, getKeyboardState, GuessResult } from "./wordleLogic";
import { isValidGuess, logRejectedGuess } from "@/lib/wordValidation";
import { useGameState } from "@/hooks/useGameState";
import { useStreak } from "@/hooks/useStreak";
import Link from "next/link";

interface WordleGameProps {
  puzzle: {
    date: string;
    answer: string;
    hint: string;
  };
}

interface WordleState {
  guesses: string[];
  results: GuessResult[];
  status: "playing" | "won" | "lost";
}

const INITIAL_STATE: WordleState = {
  guesses: [],
  results: [],
  status: "playing",
};

export function WordleGame({ puzzle }: WordleGameProps) {
  const [gameState, setGameState] = useGameState<WordleState>(
    "wordle",
    puzzle.date,
    INITIAL_STATE
  );

  const [currentGuess, setCurrentGuess] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { currentStreak, markGameCompleted, markGameWon } = useStreak();

  const keyboardState = useMemo(() => {
    return getKeyboardState(gameState.guesses, gameState.results);
  }, [gameState.guesses, gameState.results]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const submitGuess = useCallback(() => {
    if (gameState.status !== "playing") return;
    if (currentGuess.length !== 5) {
      showToast("Not enough letters");
      return;
    }

    const lower = currentGuess.toLowerCase();

    if (!isValidGuess(lower)) {
      showToast("Not in word list");
      logRejectedGuess(lower);
      return;
    }

    const result = checkGuess(lower, puzzle.answer);
    const newGuesses = [...gameState.guesses, lower];
    const newResults = [...gameState.results, result];

    const isWin = lower === puzzle.answer.toLowerCase();
    const isLoss = !isWin && newGuesses.length >= 6;
    const newStatus = isWin ? "won" : isLoss ? "lost" : "playing";

    setGameState({
      guesses: newGuesses,
      results: newResults,
      status: newStatus,
    });
    setCurrentGuess("");

    if (isWin) {
      markGameWon();
      markGameCompleted();
      setTimeout(() => setShowModal(true), 800);
    } else if (isLoss) {
      markGameCompleted();
      setTimeout(() => setShowModal(true), 800);
    }
  }, [currentGuess, gameState, puzzle.answer, markGameWon, markGameCompleted, setGameState]);

  const handleKey = useCallback(
    (key: string) => {
      if (gameState.status !== "playing") return;

      if (key === "ENTER") {
        submitGuess();
      } else if (key === "DEL" || key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Z]$/i.test(key)) {
        if (currentGuess.length < 5) {
          setCurrentGuess((prev) => prev + key.toUpperCase());
        }
      }
    },
    [currentGuess, gameState.status, submitGuess]
  );

  // Physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key === "Enter") {
        handleKey("ENTER");
      } else if (e.key === "Backspace") {
        handleKey("DEL");
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        handleKey(e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKey]);

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto w-full px-2 py-4 justify-between">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-3 mb-2">
        <Link
          href="/"
          className="text-sm font-semibold text-gray-500 hover:text-green-700 dark:hover:text-green-400 flex items-center gap-1"
        >
          ← Home
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-green-700 dark:text-green-400">
            Naija Wordle
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Clue: {puzzle.hint}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-xs font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md"
        >
          Stats
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm shadow-xl transition-all">
          {toastMessage}
        </div>
      )}

      {/* Board */}
      <div className="flex-1 flex items-center justify-center my-2">
        <WordleBoard
          guesses={gameState.guesses}
          results={gameState.results}
          currentGuess={currentGuess}
        />
      </div>

      {/* Keyboard */}
      <div className="mt-auto pt-2 pb-4">
        <WordleKeyboard keyboardState={keyboardState} onKey={handleKey} />
      </div>

      {/* Win/Loss Modal */}
      {(showModal || gameState.status !== "playing") && (
        <WordleModal
          status={gameState.status === "playing" ? "won" : gameState.status}
          answer={puzzle.answer}
          hint={puzzle.hint}
          guesses={gameState.guesses}
          results={gameState.results}
          streak={currentStreak}
          date={puzzle.date}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

