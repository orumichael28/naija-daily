/**
 * Lagos timezone date utilities.
 * Africa/Lagos is UTC+1 year-round (no DST).
 */

/** Returns today's date as "YYYY-MM-DD" in the Africa/Lagos timezone. */
export function getTodayInLagos(): string {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: "Africa/Lagos",
  });
}

/** Formats "YYYY-MM-DD" → "Friday, October 16, 2026" */
export function formatDisplayDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  // Construct at noon to avoid any DST edge cases
  return new Date(year, month - 1, day, 12).toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Adds `days` to a Date object, returning a new Date. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Formats a Date → "YYYY-MM-DD". */
export function format(date: Date, _pattern: "yyyy-MM-dd"): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
