import answers from "@/data/answers.json";

let validGuessSet: Set<string> | null = null;

export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function getValidGuessSet(): Set<string> {
  if (validGuessSet) return validGuessSet;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const generated = require("@/data/valid-guesses.json") as string[];
    validGuessSet = new Set(generated.map(normalizeWord));
  } catch {
    validGuessSet = new Set((answers as string[]).map(normalizeWord));
  }
  return validGuessSet;
}

export function isValidGuess(word: string): boolean {
  if (!word || word.length !== 5) return false;
  const normalized = normalizeWord(word);
  return getValidGuessSet().has(normalized);
}

export async function logRejectedGuess(word: string): Promise<void> {
  try {
    await fetch("/api/rejected-guess", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word: normalizeWord(word) }),
    });
  } catch {
    // Non-blocking fire-and-forget
  }
}
