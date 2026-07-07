import { test } from "node:test";
import assert from "node:assert/strict";
import { Cron } from "../src/index.js";

test("next() finds the following matching minute", () => {
  const job = new Cron("*/15 * * * *");
  const from = new Date(2026, 0, 1, 9, 7, 0); // 09:07
  assert.deepEqual(job.next(undefined, from), new Date(2026, 0, 1, 9, 15, 0));
});

test("next() is strictly after the given instant", () => {
  const job = new Cron("0 12 * * *");
  const noon = new Date(2026, 0, 1, 12, 0, 0);
  assert.deepEqual(job.next(undefined, noon), new Date(2026, 0, 2, 12, 0, 0));
});

test("next(n) returns n ascending matches", () => {
  const job = new Cron("0 0 * * *");
  const from = new Date(2026, 0, 1, 6, 0, 0);
  const runs = job.next(3, from);
  assert.deepEqual(runs, [
    new Date(2026, 0, 2, 0, 0, 0),
    new Date(2026, 0, 3, 0, 0, 0),
    new Date(2026, 0, 4, 0, 0, 0),
  ]);
});

test("day-of-month OR day-of-week when both restricted", () => {
  // The 1st of the month OR any Monday.
  const job = new Cron("0 0 1 * 1");
  const from = new Date(2026, 0, 1, 12, 0, 0); // Thu Jan 1 2026
  const first = job.next(undefined, from);
  // Next match is Monday Jan 5 (a Monday), before the next 1st.
  assert.deepEqual(first, new Date(2026, 0, 5, 0, 0, 0));
});

test("matches() reports minute-precision membership", () => {
  const job = new Cron("30 14 * * *");
  assert.equal(job.matches(new Date(2026, 5, 10, 14, 30, 45)), true);
  assert.equal(job.matches(new Date(2026, 5, 10, 14, 31, 0)), false);
});

test("prev() finds the last matching instant strictly before", () => {
  const job = new Cron("*/15 * * * *");
  const from = new Date(2026, 0, 1, 9, 7, 0); // 09:07
  assert.deepEqual(job.prev(undefined, from), new Date(2026, 0, 1, 9, 0, 0));
});

test("prev() is strictly before the given instant", () => {
  const job = new Cron("0 12 * * *");
  const noon = new Date(2026, 0, 2, 12, 0, 0);
  assert.deepEqual(job.prev(undefined, noon), new Date(2026, 0, 1, 12, 0, 0));
});

test("prev(n) returns n descending matches", () => {
  const job = new Cron("0 0 * * *");
  const from = new Date(2026, 0, 4, 6, 0, 0);
  assert.deepEqual(job.prev(3, from), [
    new Date(2026, 0, 4, 0, 0, 0),
    new Date(2026, 0, 3, 0, 0, 0),
    new Date(2026, 0, 2, 0, 0, 0),
  ]);
});

test("prev() retreats across a month boundary", () => {
  const job = new Cron("0 0 1 * *"); // midnight on the 1st
  const mar2 = new Date(2026, 2, 2, 0, 0, 0);
  assert.deepEqual(job.prev(undefined, mar2), new Date(2026, 2, 1, 0, 0, 0));
  // And one before that lands on Feb 1.
  assert.deepEqual(job.prev(undefined, new Date(2026, 2, 1, 0, 0, 0)), new Date(2026, 1, 1, 0, 0, 0));
});

test("prev then next round-trips to the same instant", () => {
  const job = new Cron("30 9 * * 1-5");
  const anchor = new Date(2026, 4, 20, 9, 30, 0); // a matching instant
  assert.equal(job.matches(anchor), true);
  const before = job.prev(undefined, anchor);
  assert.deepEqual(job.next(undefined, before), anchor);
});
