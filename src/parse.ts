import { CronError, type ParsedCron } from "./types.js";
import { FIELDS, MACROS, normalizeDow, type FieldDef } from "./fields.js";

/** Resolve a token to an integer, honoring a field's name aliases. */
function toNumber(token: string, def: FieldDef): number {
  const alias = def.names?.[token.toUpperCase()];
  if (alias !== undefined) return alias;
  if (!/^\d+$/.test(token)) {
    throw new CronError(`invalid ${def.name} value "${token}"`);
  }
  return Number(token);
}

/**
 * Parse one field into its sorted, de-duplicated list of matching values.
 * Supports `*`, `a`, `a-b`, `a,b,c`, `* /n`, `a-b/n`, and `a/n`.
 */
export function parseField(raw: string, def: FieldDef): number[] {
  const set = new Set<number>();

  for (const part of raw.split(",")) {
    if (part === "") throw new CronError(`empty ${def.name} value`);

    const [rangePart, stepPart] = part.split("/", 2);
    let step = 1;
    if (stepPart !== undefined) {
      if (!/^\d+$/.test(stepPart) || Number(stepPart) === 0) {
        throw new CronError(`invalid ${def.name} step "${stepPart}"`);
      }
      step = Number(stepPart);
    }

    let lo: number;
    let hi: number;
    if (rangePart === "*") {
      lo = def.min;
      hi = def.max;
    } else if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-", 2);
      lo = toNumber(a, def);
      hi = toNumber(b, def);
    } else {
      lo = toNumber(rangePart, def);
      // "a/n" means a, a+n, … up to the field maximum.
      hi = stepPart === undefined ? lo : def.max;
    }

    if (lo < def.min || hi > def.max) {
      throw new CronError(`${def.name} value out of range (${def.min}-${def.max})`);
    }
    if (lo > hi) {
      throw new CronError(`${def.name} range start ${lo} is after end ${hi}`);
    }
    for (let v = lo; v <= hi; v += step) set.add(v);
  }

  return [...set].sort((a, b) => a - b);
}

/**
 * Parse a full cron expression (or a `@macro`) into a {@link ParsedCron}.
 * @throws {CronError} on any syntactic error.
 */
export function parse(expression: string): ParsedCron {
  const trimmed = expression.trim();
  if (trimmed === "") throw new CronError("empty cron expression");

  const expanded = MACROS[trimmed.toLowerCase()] ?? trimmed;
  const fields = expanded.split(/\s+/);
  if (fields.length !== 5) {
    throw new CronError(
      `expected 5 fields, got ${fields.length} (in "${trimmed}")`,
    );
  }

  const [min, hr, dom, mon, dowRaw] = fields;
  const dowRestricted = dowRaw !== "*";
  const domRestricted = dom !== "*";

  return {
    minute: parseField(min, FIELDS.minute),
    hour: parseField(hr, FIELDS.hour),
    dayOfMonth: parseField(dom, FIELDS.dayOfMonth),
    month: parseField(mon, FIELDS.month),
    dayOfWeek: normalizeDow(parseField(dowRaw, FIELDS.dayOfWeek)),
    domRestricted,
    dowRestricted,
    source: expanded,
  };
}
