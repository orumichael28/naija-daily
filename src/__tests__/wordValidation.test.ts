/**
 * Word validation tests.
 *
 * NOTE: isValidGuess reads valid-guesses.json at module import time.
 * We mock the JSON module so these tests don't depend on the full 9k-word file.
 */

// Mock the JSON file before importing the module
jest.mock("@/data/valid-guesses.json", () => ["crane", "egusi", "lagos", "abbot", "stale"], { virtual: true });

// Re-import after mock
import { isValidGuess } from "@/lib/wordValidation";

describe("isValidGuess", () => {
  it("accepts a common English word", () => {
    expect(isValidGuess("crane")).toBe(true);
  });

  it("accepts a Naija word", () => {
    expect(isValidGuess("egusi")).toBe(true);
  });

  it("rejects nonsense / words not in the list", () => {
    expect(isValidGuess("zxzxz")).toBe(false);
    expect(isValidGuess("qqqqq")).toBe(false);
  });

  it("is case-insensitive (normalizes to lowercase)", () => {
    expect(isValidGuess("CRANE")).toBe(true);
    expect(isValidGuess("Egusi")).toBe(true);
  });

  it("rejects empty string", () => {
    expect(isValidGuess("")).toBe(false);
  });

  it("rejects words shorter than 5 letters", () => {
    expect(isValidGuess("cat")).toBe(false);
  });

  it("rejects words longer than 5 letters", () => {
    expect(isValidGuess("cranberry")).toBe(false);
  });
});

