import { getTodayInLagos, formatDisplayDate, addDays, format } from "@/lib/dates";

describe("getTodayInLagos", () => {
  it("returns a string in YYYY-MM-DD format", () => {
    const result = getTodayInLagos();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns a valid date", () => {
    const result = getTodayInLagos();
    const d = new Date(result);
    expect(d.toString()).not.toBe("Invalid Date");
  });
});

describe("formatDisplayDate", () => {
  it("formats a known date correctly", () => {
    const result = formatDisplayDate("2026-10-25");
    // Should contain the year and day
    expect(result).toContain("2026");
    expect(result).toContain("25");
  });

  it("includes day of week", () => {
    // 2026-10-25 is a Sunday
    const result = formatDisplayDate("2026-10-25");
    expect(result.toLowerCase()).toContain("sunday");
  });
});

describe("addDays", () => {
  it("adds 0 days and returns same date", () => {
    const d = new Date(2026, 9, 25); // Oct 25 2026
    const result = addDays(d, 0);
    expect(result.getDate()).toBe(25);
    expect(result.getMonth()).toBe(9);
    expect(result.getFullYear()).toBe(2026);
  });

  it("adds 7 days correctly", () => {
    const d = new Date(2026, 9, 25); // Oct 25 2026
    const result = addDays(d, 7);
    expect(result.getDate()).toBe(1);
    expect(result.getMonth()).toBe(10); // November
  });

  it("does not mutate the original date", () => {
    const d = new Date(2026, 9, 25);
    addDays(d, 5);
    expect(d.getDate()).toBe(25);
  });
});

describe("format", () => {
  it("formats a date to YYYY-MM-DD", () => {
    const d = new Date(2026, 9, 5); // Oct 5 2026 (month is 0-indexed)
    expect(format(d, "yyyy-MM-dd")).toBe("2026-10-05");
  });

  it("pads month and day with zeros", () => {
    const d = new Date(2026, 0, 9); // Jan 9 2026
    expect(format(d, "yyyy-MM-dd")).toBe("2026-01-09");
  });
});

