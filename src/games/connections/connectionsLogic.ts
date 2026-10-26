export interface ConnectionsGroup {
  id: number;
  label: string;
  color: "yellow" | "green" | "blue" | "purple";
  difficulty: 1 | 2 | 3 | 4;
  words: string[];
}

export interface ConnectionsPuzzle {
  date: string;
  groups: ConnectionsGroup[];
}

/**
 * Modern Fisher-Yates shuffle algorithm.
 */
export function shuffleTiles<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Checks if 4 selected words match any unsolved group.
 */
export function checkSelection(
  selected: string[],
  groups: ConnectionsGroup[],
  solvedGroupIds: number[]
): ConnectionsGroup | null {
  if (selected.length !== 4) return null;

  const normalizedSelected = new Set(selected.map((w) => w.toUpperCase()));

  for (const group of groups) {
    if (solvedGroupIds.includes(group.id)) continue;

    const matches = group.words.filter((w) => normalizedSelected.has(w.toUpperCase()));
    if (matches.length === 4) {
      return group;
    }
  }

  return null;
}

/**
 * Checks if exactly 3 out of 4 selected words belong to an unsolved group ("One away!").
 */
export function isOneAway(
  selected: string[],
  groups: ConnectionsGroup[],
  solvedGroupIds: number[]
): boolean {
  if (selected.length !== 4) return false;

  const normalizedSelected = new Set(selected.map((w) => w.toUpperCase()));

  for (const group of groups) {
    if (solvedGroupIds.includes(group.id)) continue;

    const matches = group.words.filter((w) => normalizedSelected.has(w.toUpperCase()));
    if (matches.length === 3) {
      return true;
    }
  }

  return false;
}

