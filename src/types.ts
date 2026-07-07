/**
 * Public types for Cronlet.
 *
 * A cron expression is five space-separated fields:
 *
 *   minute  hour  day-of-month  month  day-of-week
 *
 * Each field parses to the sorted, de-duplicated list of integer values it
 * matches. `dom`/`dow` also record whether they were *restricted* (anything
 * other than `*`), because standard Vixie cron ORs the two day fields together
 * only when both are restricted.
 */
export interface ParsedCron {
  /** Matching minutes, 0–59. */
  minute: number[];
  /** Matching hours, 0–23. */
  hour: number[];
  /** Matching days of the month, 1–31. */
  dayOfMonth: number[];
  /** Matching months, 1–12. */
  month: number[];
  /** Matching days of the week, 0–6 (0 = Sunday). */
  dayOfWeek: number[];
  /** True when the day-of-month field was anything other than `*`. */
  domRestricted: boolean;
  /** True when the day-of-week field was anything other than `*`. */
  dowRestricted: boolean;
  /** The normalized source expression that produced this parse. */
  source: string;
}

/** Thrown when an expression is syntactically invalid. */
export class CronError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CronError";
  }
}
