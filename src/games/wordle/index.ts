import type { GameDefinition } from "@/games/types";

export const wordleGame: GameDefinition = {
  id: "wordle",
  name: "Wordle",
  description: "Guess the 5-letter Naija word in 6 tries",
  path: "/wordle",
  loadPuzzle: async (date: string) => {
    const res = await fetch(`/api/puzzle/wordle/${date}`);
    if (!res.ok) throw new Error("Could not load Wordle puzzle");
    return res.json();
  },
};

