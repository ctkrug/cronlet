/**
 * Field definitions: bounds and name aliases for each of the five cron fields.
 *
 * `min`/`max` are the *input* bounds accepted by the parser. Day-of-week
 * accepts 0–7 on input (both 0 and 7 mean Sunday) and is normalized to 0–6
 * after parsing; see {@link normalizeDow}.
 */
export interface FieldDef {
  readonly name: string;
  readonly min: number;
  readonly max: number;
  /** Uppercase alias → numeric value (e.g. `JAN` → 1, `SUN` → 0). */
  readonly names?: Readonly<Record<string, number>>;
}

const MONTHS: Record<string, number> = {
  JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
  JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
};

const DAYS: Record<string, number> = {
  SUN: 0, MON: 1, TUE: 2, WED: 3, THU: 4, FRI: 5, SAT: 6,
};

/** The five fields, in cron order. */
export const FIELDS = {
  minute: { name: "minute", min: 0, max: 59 },
  hour: { name: "hour", min: 0, max: 23 },
  dayOfMonth: { name: "day-of-month", min: 1, max: 31 },
  month: { name: "month", min: 1, max: 12, names: MONTHS },
  // 7 is accepted for Sunday on input and folded to 0 by normalizeDow.
  dayOfWeek: { name: "day-of-week", min: 0, max: 7, names: DAYS },
} as const satisfies Record<string, FieldDef>;

/** Fold day-of-week 7 → 0 (both mean Sunday) and de-duplicate. */
export function normalizeDow(values: number[]): number[] {
  const set = new Set(values.map((v) => (v === 7 ? 0 : v)));
  return [...set].sort((a, b) => a - b);
}

/** Named shortcut expressions (`@daily`, `@hourly`, …). */
export const MACROS: Record<string, string> = {
  "@yearly": "0 0 1 1 *",
  "@annually": "0 0 1 1 *",
  "@monthly": "0 0 1 * *",
  "@weekly": "0 0 * * 0",
  "@daily": "0 0 * * *",
  "@midnight": "0 0 * * *",
  "@hourly": "0 * * * *",
};
