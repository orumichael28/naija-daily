/**
 * Streak logic unit tests.
 * We test the pure logic, not the hook itself (which needs DOM/localStorage).
 */

describe("streak increment logic", () => {
  // Simulating the logic inside useStreak's markGameCompleted
  function markGameCompleted(
    prev: {
      lastPlayedDate: string;
      currentStreak: number;
      bestStreak: number;
      gamesPlayed: number;
      finishedToday: boolean;
    },
    today: string
  ) {
    // Already counted for today
    if (prev.finishedToday && prev.lastPlayedDate === today) return prev;

    const isConsecutive =
      prev.lastPlayedDate === "" ||
      (() => {
        const last = new Date(prev.lastPlayedDate);
        const now = new Date(today);
        const diff = Math.round((now.getTime() - last.getTime()) / 86_400_000);
        return diff === 1;
      })();

    const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;

    return {
      ...prev,
      lastPlayedDate: today,
      currentStreak: newStreak,
      bestStreak: Math.max(prev.bestStreak, newStreak),
      gamesPlayed: prev.gamesPlayed + 1,
      finishedToday: true,
    };
  }

  const baseState = {
    lastPlayedDate: "",
    currentStreak: 0,
    bestStreak: 0,
    gamesPlayed: 0,
    finishedToday: false,
  };

  it("starts a streak on first game", () => {
    const result = markGameCompleted(baseState, "2026-10-25");
    expect(result.currentStreak).toBe(1);
    expect(result.gamesPlayed).toBe(1);
    expect(result.finishedToday).toBe(true);
    expect(result.lastPlayedDate).toBe("2026-10-25");
  });

  it("increments streak on consecutive day", () => {
    const prev = {
      ...baseState,
      lastPlayedDate: "2026-10-24",
      currentStreak: 3,
      bestStreak: 5,
      gamesPlayed: 10,
      finishedToday: false,
    };
    const result = markGameCompleted(prev, "2026-10-25");
    expect(result.currentStreak).toBe(4);
    expect(result.bestStreak).toBe(5); // not beaten
  });

  it("updates bestStreak when current exceeds it", () => {
    const prev = {
      ...baseState,
      lastPlayedDate: "2026-10-24",
      currentStreak: 5,
      bestStreak: 5,
      gamesPlayed: 10,
      finishedToday: false,
    };
    const result = markGameCompleted(prev, "2026-10-25");
    expect(result.currentStreak).toBe(6);
    expect(result.bestStreak).toBe(6);
  });

  it("resets streak to 1 if a day was missed", () => {
    const prev = {
      ...baseState,
      lastPlayedDate: "2026-10-20", // 5 days ago
      currentStreak: 7,
      bestStreak: 7,
      gamesPlayed: 15,
      finishedToday: false,
    };
    const result = markGameCompleted(prev, "2026-10-25");
    expect(result.currentStreak).toBe(1);
    expect(result.bestStreak).toBe(7); // best preserved
  });

  it("does not double-count the same day", () => {
    const prev = {
      ...baseState,
      lastPlayedDate: "2026-10-25",
      currentStreak: 3,
      bestStreak: 5,
      gamesPlayed: 10,
      finishedToday: true,
    };
    const result = markGameCompleted(prev, "2026-10-25");
    // Same ref returned, no mutation
    expect(result).toBe(prev);
    expect(result.gamesPlayed).toBe(10);
  });

  it("preserves streak if played today already", () => {
    const prev = {
      ...baseState,
      lastPlayedDate: "2026-10-25",
      currentStreak: 4,
      bestStreak: 4,
      gamesPlayed: 20,
      finishedToday: true,
    };
    const result = markGameCompleted(prev, "2026-10-25");
    expect(result.currentStreak).toBe(4);
  });
});

describe("streak reset on missed day", () => {
  it("detects missed day (diff > 1)", () => {
    const last = new Date("2026-10-22");
    const now = new Date("2026-10-25");
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);
    expect(diffDays).toBe(3);
    expect(diffDays > 1).toBe(true); // should reset
  });

  it("detects consecutive day (diff === 1)", () => {
    const last = new Date("2026-10-24");
    const now = new Date("2026-10-25");
    const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);
    expect(diffDays).toBe(1); // should NOT reset
  });
});

