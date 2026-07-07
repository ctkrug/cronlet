/**
 * Cronlet — a tiny, dependency-free cron parser, scheduler, and describer.
 *
 * ```ts
 * import { Cron } from "cronlet";
 * const job = new Cron("*​/15 9-17 * * 1-5");
 * job.describe();  // human-readable sentence
 * job.next();      // next matching Date
 * job.next(5);     // next 5 matching Dates
 * ```
 */
import type { ParsedCron } from "./types.js";
import { parse } from "./parse.js";
import { matches, next, nextN, prev, prevN } from "./schedule.js";
import { describe } from "./describe.js";

export { CronError } from "./types.js";
export type { ParsedCron } from "./types.js";
export { parse } from "./parse.js";
export { matches, next, nextN, prev, prevN } from "./schedule.js";
export { describe } from "./describe.js";

/** An object wrapper around a parsed expression with convenience methods. */
export class Cron {
  /** The parsed representation of {@link source}. */
  readonly parsed: ParsedCron;

  constructor(expression: string) {
    this.parsed = parse(expression);
  }

  /** The normalized source expression. */
  get source(): string {
    return this.parsed.source;
  }

  /** Does the given date match this schedule (to minute precision)? */
  matches(date: Date = new Date()): boolean {
    return matches(this.parsed, date);
  }

  /** The next matching date, or the next `count` dates if given. */
  next(count?: undefined, after?: Date): Date;
  next(count: number, after?: Date): Date[];
  next(count?: number, after: Date = new Date()): Date | Date[] {
    return count === undefined
      ? next(this.parsed, after)
      : nextN(this.parsed, count, after);
  }

  /** The previous matching date, or the previous `count` dates if given. */
  prev(count?: undefined, before?: Date): Date;
  prev(count: number, before?: Date): Date[];
  prev(count?: number, before: Date = new Date()): Date | Date[] {
    return count === undefined
      ? prev(this.parsed, before)
      : prevN(this.parsed, count, before);
  }

  /** A plain-English description of this schedule. */
  describe(): string {
    return describe(this.parsed);
  }
}
