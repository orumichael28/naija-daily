import type { GameDefinition } from "./types";

export const games: GameDefinition[] = [
  {
    id: "wordle",
    name: "Wordle",
    description: "Guess the 5-letter Naija word in 6 tries",
    path: "/wordle",
    loadPuzzle: async (date: string) => {
      const res = await fetch(`/api/puzzle/wordle/${date}`);
      if (!res.ok) throw new Error("Puzzle not found");
      return res.json();
    },
  },
  {
    id: "connections",
    name: "Connections",
    description: "Find four groups of four Nigerian words",
    path: "/connections",
    loadPuzzle: async (date: string) => {
      const res = await fetch(`/api/puzzle/connections/${date}`);
      if (!res.ok) throw new Error("Puzzle not found");
      return res.json();
    },
  },
  {
    id: "crossword",
    name: "Mini Crossword",
    description: "A Nigerian-themed mini crossword",
    path: "/crossword",
    comingSoon: true,
    loadPuzzle: async () => null,
  },
  {
    id: "wordsearch",
    name: "Word Search",
    description: "Find hidden Naija words",
    path: "/wordsearch",
    comingSoon: true,
    loadPuzzle: async () => null,
  },
];

export function getGame(id: string): GameDefinition | undefined {
  return games.find((g) => g.id === id);
}

