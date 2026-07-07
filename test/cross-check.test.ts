import { test } from "node:test";
import assert from "node:assert/strict";
import { CronExpressionParser } from "cron-parser";
import { Cron } from "../src/index.js";

// Dev-only cross-check: assert Cronlet's next-N times match `cron-parser`, an
// independent, widely-used reference implementation, across a representative
// expression set. (`node-cron` is a task *scheduler* and exposes no next-time
// API, so cron-parser is the right correctness oracle.) cron-parser is a
// devDependency only — the shipped library stays zero-dependency.

const EXPRESSIONS = [
  "*/15 9-17 * * 1-5",
  "0 0 * * *",
  "30 9 * * 1",
  "0 0 1 * *",
  "0 12 * * 0",
  "*/5 * * * *",
  "0 0 1 1 *",
  "15 14 1 * *",
  "0 22 * * 1-5",
  "23 0-20/2 * * *",
  "0 0,12 1 */2 *",
  "0 4 8-14 * *",
  "5 4 * * SUN",
  "0 0 1 * 1", // the day-of-month OR day-of-week case
  "0 9 * * 6,0",
  "0 3 * 3-5 *",
  "*/30 * 1-7 * *",
  "0 0 29 2 *", // leap-year-only day
];

// A few anchors, including dates adjacent to US DST transitions. (Under a UTC
// runner these still fully exercise the field logic.)
const ANCHORS = [
  new Date(2026, 0, 1, 0, 0, 0),
  new Date(2026, 2, 7, 0, 0, 0),
  new Date(2026, 10, 1, 0, 0, 0),
];

test("next(5) matches cron-parser across a representative set", () => {
  for (const expr of EXPRESSIONS) {
    for (const anchor of ANCHORS) {
      const mine = new Cron(expr).next(5, anchor).map((d) => d.getTime());

      const it = CronExpressionParser.parse(expr, { currentDate: anchor });
      const theirs = Array.from({ length: 5 }, () => it.next().toDate().getTime());

      assert.deepEqual(
        mine,
        theirs,
        `mismatch for "${expr}" from ${anchor.toISOString()}`,
      );
    }
  }
});
