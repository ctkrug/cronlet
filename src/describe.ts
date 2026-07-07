import type { ParsedCron } from "./types.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_NAMES = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

/** Is `values` every integer in [min, max]? (i.e. an unrestricted `*` field) */
function isFull(values: number[], min: number, max: number): boolean {
  return values.length === max - min + 1;
}

/**
 * If `values` is an evenly spaced run starting at `min` covering to `max`,
 * return its step (so `*​/15` on minutes → 15). Otherwise return null.
 */
function stepOf(values: number[], min: number, max: number): number | null {
  if (values.length < 2 || values[0] !== min) return null;
  const step = values[1] - values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] !== step) return null;
  }
  // The run must reach the top of the field to read as "every N".
  return values[values.length - 1] + step > max ? step : null;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** The "when during the day" clause. */
function timeClause(parsed: ParsedCron): string {
  const minEvery = stepOf(parsed.minute, 0, 59);
  const hourFull = isFull(parsed.hour, 0, 23);
  const minFull = isFull(parsed.minute, 0, 59);

  // A single minute + single hour reads as a clock time.
  if (parsed.minute.length === 1 && parsed.hour.length === 1) {
    return `at ${pad(parsed.hour[0])}:${pad(parsed.minute[0])}`;
  }
  if (minFull) {
    return hourFull ? "every minute" : `every minute past every hour listed`;
  }
  if (minEvery && hourFull) {
    return `every ${minEvery} minutes`;
  }
  if (parsed.minute.length === 1 && hourFull) {
    return `at minute ${parsed.minute[0]} of every hour`;
  }
  const mins = joinList(parsed.minute.map(String));
  return `at minute ${mins}`;
}

/** The "which days" clause, or empty when the day fields are unrestricted. */
function dayClause(parsed: ParsedCron): string {
  const parts: string[] = [];

  if (parsed.dowRestricted && !isFull(parsed.dayOfWeek, 0, 6)) {
    const step = stepOf(parsed.dayOfWeek, 0, 6);
    if (step) {
      parts.push(`every ${step} days of the week`);
    } else {
      parts.push(`on ${joinList(parsed.dayOfWeek.map((d) => DAY_NAMES[d]))}`);
    }
  }
  if (parsed.domRestricted && !isFull(parsed.dayOfMonth, 1, 31)) {
    parts.push(`on day-of-month ${joinList(parsed.dayOfMonth.map(String))}`);
  }
  if (!isFull(parsed.month, 1, 12)) {
    parts.push(`in ${joinList(parsed.month.map((m) => MONTH_NAMES[m - 1]))}`);
  }
  return parts.join(", ");
}

/**
 * Render a parsed expression as a plain-English sentence, e.g.
 * `"*​/15 9-17 * * 1-5"` → `"Every 15 minutes, at hours 9 through 17, on
 * Monday through Friday"` (phrasing is refined as the describer grows).
 */
export function describe(parsed: ParsedCron): string {
  const time = timeClause(parsed);
  const days = dayClause(parsed);
  const sentence = days ? `${time}, ${days}` : time;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}
