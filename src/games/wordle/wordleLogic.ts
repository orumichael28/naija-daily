export type LetterState = "correct" | "present" | "absent" | "empty";
export type GuessResult = LetterState[];

/**
 * Evaluates a 5-letter guess against the target answer with standard Wordle rules
 * (correct duplicate letter precedence).
 */
export function checkGuess(guess: string, answer: string): GuessResult {
  const g = guess.toLowerCase();
  const a = answer.toLowerCase();
  const result: LetterState[] = ["absent", "absent", "absent", "absent", "absent"];
  const letterCounts: Record<string, number> = {};

  // First pass: identify green (exact matches) and count remaining letters
  for (let i = 0; i < 5; i++) {
    if (g[i] === a[i]) {
      result[i] = "correct";
    } else {
      letterCounts[a[i]] = (letterCounts[a[i]] || 0) + 1;
    }
  }

  // Second pass: identify yellow (present in wrong spot)
  for (let i = 0; i < 5; i++) {
    if (result[i] !== "correct") {
      const char = g[i];
      if (letterCounts[char] && letterCounts[char] > 0) {
        result[i] = "present";
        letterCounts[char]--;
      }
    }
  }

  return result;
}

/**
 * Aggregates overall keyboard status per letter.
 * Precedence: correct > present > absent.
 */
export function getKeyboardState(
  guesses: string[],
  results: GuessResult[]
): Record<string, LetterState> {
  const state: Record<string, LetterState> = {};

  guesses.forEach((guess, rIndex) => {
    const rowResult = results[rIndex];
    if (!rowResult) return;

    for (let cIndex = 0; cIndex < guess.length; cIndex++) {
      const letter = guess[cIndex].toUpperCase();
      const status = rowResult[cIndex];

      if (status === "correct") {
        state[letter] = "correct";
      } else if (status === "present") {
        if (state[letter] !== "correct") {
          state[letter] = "present";
        }
      } else if (status === "absent") {
        if (!state[letter]) {
          state[letter] = "absent";
        }
      }
    }
  });

  return state;
}

