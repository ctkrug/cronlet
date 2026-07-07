import { test } from "node:test";
import assert from "node:assert/strict";
import { Cron, CronError, parse, describe, next, prev, matches } from "../src/index.js";

/** Small seeded LCG so a failing case reproduces deterministically. */
function makeRng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/** Render a random-but-valid field expression within [min, max]. */
function randomField(rng: () => number, min: number, max: number): string {
  const pick = (lo: number, hi: number) => lo + Math.floor(rng() * (hi - lo + 1));
  switch (Math.floor(rng() * 5)) {
    case 0:
      return "*";
    case 1:
      return String(pick(min, max));
    case 2: {
      const a = pick(min, max);
      const b = pick(a, max); // keep start ≤ end so it's valid
      return `${a}-${b}`;
    }
    case 3:
      return `*/${pick(1, Math.max(1, max))}`;
    default: {
      const a = pick(min, max);
      const b = pick(min, max);
      return `${Math.min(a, b)},${Math.max(a, b)}`;
    }
  }
}

test("describe/next/prev never throw on any parsed expression (property)", () => {
  const bounds: [number, number][] = [
    [0, 59], [0, 23], [1, 31], [1, 12], [0, 6],
  ];
  const rng = makeRng(0xc0ffee);
  const anchor = new Date(2026, 3, 15, 10, 30, 0);

  for (let i = 0; i < 500; i++) {
    const expr = bounds.map(([lo, hi]) => randomField(rng, lo, hi)).join(" ");
    let parsed;
    try {
      parsed = parse(expr);
    } catch {
      // Some random combos are legitimately invalid (e.g. an empty day set);
      // the contract is only that *parsed* expressions never throw downstream.
      continue;
    }
    // describe() is pure formatting — it must never throw.
    assert.doesNotThrow(() => describe(parsed), `describe threw for "${expr}"`);
    // next()/prev() may hit a genuinely impossible date (e.g. Feb 30); when they
    // do they must fail with a *designed* CronError, never an undesigned crash.
    for (const fn of [next, prev]) {
      try {
        const hit = fn(parsed, anchor);
        // Whatever instant next()/prev() returns MUST itself match the schedule.
        assert.ok(matches(parsed, hit), `${fn.name} returned a non-matching instant for "${expr}"`);
      } catch (err) {
        assert.ok(err instanceof CronError, `${fn.name} threw non-CronError for "${expr}": ${err}`);
      }
    }
  }
});

test("a parsed expression always round-trips through the Cron wrapper", () => {
  const job = new Cron("*/10 8-18 * * MON-FRI");
  const runs = job.next(4, new Date(2026, 0, 1));
  assert.equal(runs.length, 4);
  for (const r of runs) assert.equal(job.matches(r), true);
});
