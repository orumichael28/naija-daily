"use client";
import React, { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark =
      localStorage.getItem("naija-daily:theme") === "dark" ||
      (!("naija-daily:theme" in localStorage) &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle("dark", nextDark);
    localStorage.setItem("naija-daily:theme", nextDark ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}

