import { CronError, type ParsedCron } from "./types.js";

/** Safety cap: each iteration advances at least one calendar field. */
const MAX_ITERATIONS = 100_000;

/**
 * Standard Vixie day matching: when *both* day-of-month and day-of-week are
 * restricted, a day matches if *either* does (an OR). When only one is
 * restricted, only that one is consulted.
 */
function dayMatches(parsed: ParsedCron, d: Date): boolean {
  const domOk = parsed.dayOfMonth.includes(d.getDate());
  const dowOk = parsed.dayOfWeek.includes(d.getDay());
  if (parsed.domRestricted && parsed.dowRestricted) return domOk || dowOk;
  if (parsed.domRestricted) return domOk;
  if (parsed.dowRestricted) return dowOk;
  return true;
}

/** Does `d` (to minute precision) match the expression? */
export function matches(parsed: ParsedCron, d: Date): boolean {
  return (
    parsed.minute.includes(d.getMinutes()) &&
    parsed.hour.includes(d.getHours()) &&
    parsed.month.includes(d.getMonth() + 1) &&
    dayMatches(parsed, d)
  );
}

/**
 * The first matching instant strictly after `after`, computed in local time by
 * advancing whichever field is out of range and zeroing the ones below it.
 *
 * @throws {CronError} if no match is found within the safety cap (e.g. an
 * impossible date like `0 0 30 2 *`).
 */
export function next(parsed: ParsedCron, after: Date = new Date()): Date {
  const d = new Date(after.getTime());
  d.setSeconds(0, 0);
  d.setMinutes(d.getMinutes() + 1); // strictly after `after`

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (!parsed.month.includes(d.getMonth() + 1)) {
      d.setMonth(d.getMonth() + 1, 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!dayMatches(parsed, d)) {
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      continue;
    }
    if (!parsed.hour.includes(d.getHours())) {
      d.setHours(d.getHours() + 1, 0, 0, 0);
      continue;
    }
    if (!parsed.minute.includes(d.getMinutes())) {
      d.setMinutes(d.getMinutes() + 1, 0, 0);
      continue;
    }
    return d;
  }

  throw new CronError(`no matching time found for "${parsed.source}"`);
}

/** The next `count` matching instants after `after`, in ascending order. */
export function nextN(parsed: ParsedCron, count: number, after: Date = new Date()): Date[] {
  const out: Date[] = [];
  let cursor = after;
  for (let i = 0; i < count; i++) {
    cursor = next(parsed, cursor);
    out.push(cursor);
  }
  return out;
}
