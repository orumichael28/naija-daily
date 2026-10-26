"use client";
import { useState, useEffect, useCallback } from "react";
import { getTodayInLagos } from "@/lib/dates";

interface StreakData {
  lastPlayedDate: string;
  currentStreak: number;
  bestStreak: number;
  gamesPlayed: number;
  gamesWon: number;
  finishedToday: boolean;
}

const STORAGE_KEY = "naija-daily:streak";

function getDefaultData(): StreakData {
  return {
    lastPlayedDate: "",
    currentStreak: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    finishedToday: false,
  };
}

function loadData(): StreakData {
  if (typeof window === "undefined") return getDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return { ...getDefaultData(), ...JSON.parse(raw) };
  } catch {
    return getDefaultData();
  }
}

function saveData(data: StreakData) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useStreak() {
  const [data, setData] = useState<StreakData>(getDefaultData);

  useEffect(() => {
    const stored = loadData();
    const today = getTodayInLagos();

    if (stored.lastPlayedDate && stored.lastPlayedDate !== today) {
      const last = new Date(stored.lastPlayedDate);
      const now = new Date(today);
      const diffDays = Math.round(
        (now.getTime() - last.getTime()) / 86_400_000
      );
      if (diffDays > 1) {
        // Missed one or more days — reset streak
        stored.currentStreak = 0;
        stored.finishedToday = false;
        saveData(stored);
      } else {
        // New consecutive day
        stored.finishedToday = false;
      }
    }

    setData(stored);
  }, []);

  const markGameCompleted = useCallback(() => {
    setData((prev) => {
      const today = getTodayInLagos();
      // Already counted for today
      if (prev.finishedToday && prev.lastPlayedDate === today) return prev;

      const isConsecutive =
        prev.lastPlayedDate === "" ||
        (() => {
          const last = new Date(prev.lastPlayedDate);
          const now = new Date(today);
          const diff = Math.round(
            (now.getTime() - last.getTime()) / 86_400_000
          );
          return diff === 1;
        })();

      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;

      const updated: StreakData = {
        ...prev,
        lastPlayedDate: today,
        currentStreak: newStreak,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        gamesPlayed: prev.gamesPlayed + 1,
        finishedToday: true,
      };
      saveData(updated);
      return updated;
    });
  }, []);

  const markGameWon = useCallback(() => {
    setData((prev) => {
      const updated = { ...prev, gamesWon: prev.gamesWon + 1 };
      saveData(updated);
      return updated;
    });
  }, []);

  return {
    currentStreak: data.currentStreak,
    bestStreak: data.bestStreak,
    gamesPlayed: data.gamesPlayed,
    gamesWon: data.gamesWon,
    finishedToday: data.finishedToday,
    markGameCompleted,
    markGameWon,
  };
}

