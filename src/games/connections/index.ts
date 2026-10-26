import type { GameDefinition } from "@/games/types";

export const connectionsGame: GameDefinition = {
  id: "connections",
  name: "Connections",
  description: "Find four groups of four Nigerian words",
  path: "/connections",
  loadPuzzle: async (date: string) => {
    const res = await fetch(`/api/puzzle/connections/${date}`);
    if (!res.ok) throw new Error("Could not load Connections puzzle");
    return res.json();
  },
};

