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
 * If `values` is an evenly spaced run starting at `min` reaching `max`, return
 * its step (so `*​/15` on minutes → 15). Otherwise return null. A step of 1 is
 * reported as null because that is just a full field.
 */
function stepOf(values: number[], min: number, max: number): number | null {
  if (values.length < 2 || values[0] !== min) return null;
  const step = values[1] - values[0];
  if (step < 2) return null;
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] !== step) return null;
  }
  // The run must reach the top of the field to read as "every N".
  return values[values.length - 1] + step > max ? step : null;
}

/** Are `values` a contiguous ascending run of length ≥ 3? */
function isRange(values: number[]): boolean {
  if (values.length < 3) return false;
  for (let i = 1; i < values.length; i++) {
    if (values[i] - values[i - 1] !== 1) return false;
  }
  return true;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** English ordinal: 1→"1st", 2→"2nd", 3→"3rd", 11→"11th", 21→"21st". */
function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
}

/** Render a value set as either an "A through B" range or an and-joined list. */
function listOrRange(values: number[], render: (v: number) => string): string {
  if (isRange(values)) {
    return `${render(values[0])} through ${render(values[values.length - 1])}`;
  }
  return joinList(values.map(render));
}

/** The minute noun phrase, e.g. "every minute", "every 15th minute", "minute 0 and 30". */
function minutePhrase(minute: number[]): string {
  if (isFull(minute, 0, 59)) return "every minute";
  const step = stepOf(minute, 0, 59);
  if (step) return `every ${ordinal(step)} minute`;
  if (minute.length === 1) return `minute ${minute[0]}`;
  return `minute ${listOrRange(minute, String)}`;
}

/** The hour noun phrase used after "past", e.g. "hour 9 through 17", "every 2nd hour". */
function hourPhrase(hour: number[]): string {
  const step = stepOf(hour, 0, 23);
  if (step) return `every ${ordinal(step)} hour`;
  if (hour.length === 1) return `hour ${hour[0]}`;
  return `hour ${listOrRange(hour, String)}`;
}

/** The time-of-day clause: everything the minute and hour fields say together. */
function timeClause(parsed: ParsedCron): string {
  const minFull = isFull(parsed.minute, 0, 59);
  const hourFull = isFull(parsed.hour, 0, 23);

  // Both a single value → an exact clock time.
  if (parsed.minute.length === 1 && parsed.hour.length === 1) {
    return `At ${pad(parsed.hour[0])}:${pad(parsed.minute[0])}`;
  }
  if (minFull && hourFull) return "Every minute";

  const minStep = stepOf(parsed.minute, 0, 59);
  // Friendly forms when the hour is unrestricted.
  if (hourFull) {
    if (minStep) return `Every ${minStep} minutes`;
    return `At ${minutePhrase(parsed.minute)}`;
  }
  return `At ${minutePhrase(parsed.minute)} past ${hourPhrase(parsed.hour)}`;
}

/** The day-of-week phrase, e.g. "Monday through Friday", "every 2nd day of the week". */
function dowPhrase(values: number[]): string {
  const step = stepOf(values, 0, 6);
  if (step) return `every ${ordinal(step)} day of the week`;
  return listOrRange(values, (d) => DAY_NAMES[d]);
}

/** The day-of-month phrase, e.g. "day-of-month 1", "day-of-month 1 through 5". */
function domPhrase(values: number[]): string {
  const step = stepOf(values, 1, 31);
  if (step) return `every ${ordinal(step)} day-of-month`;
  return `day-of-month ${listOrRange(values, String)}`;
}

/**
 * The day clause. When both day fields are restricted the standard cron OR rule
 * applies, so they are joined with "or" to surface that behavior explicitly.
 */
function dayClause(parsed: ParsedCron): string {
  const domActive = parsed.domRestricted && !isFull(parsed.dayOfMonth, 1, 31);
  const dowActive = parsed.dowRestricted && !isFull(parsed.dayOfWeek, 0, 6);

  if (domActive && dowActive) {
    return `on ${domPhrase(parsed.dayOfMonth)} or ${dowPhrase(parsed.dayOfWeek)}`;
  }
  if (domActive) return `on ${domPhrase(parsed.dayOfMonth)}`;
  if (dowActive) return `on ${dowPhrase(parsed.dayOfWeek)}`;
  return "";
}

/** The month clause, or empty when every month matches. */
function monthClause(parsed: ParsedCron): string {
  if (isFull(parsed.month, 1, 12)) return "";
  return `in ${listOrRange(parsed.month, (m) => MONTH_NAMES[m - 1])}`;
}

/**
 * Render a parsed expression as a plain-English sentence by reasoning about the
 * shape of each field (full / single / step / range / list) rather than pattern
 * matching known strings, so it generalizes to any valid expression.
 *
 * @example
 * describe(parse("*​/15 9-17 * * 1-5"))
 * // "At every 15th minute past hour 9 through 17, on Monday through Friday"
 */
export function describe(parsed: ParsedCron): string {
  const clauses = [timeClause(parsed), dayClause(parsed), monthClause(parsed)];
  return clauses.filter(Boolean).join(", ");
}
