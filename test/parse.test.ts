import { test } from "node:test";
import assert from "node:assert/strict";
import { parse } from "../src/parse.js";
import { CronError } from "../src/types.js";

test("parses a wildcard expression to full field ranges", () => {
  const p = parse("* * * * *");
  assert.equal(p.minute.length, 60);
  assert.equal(p.hour.length, 24);
  assert.equal(p.month.length, 12);
  assert.equal(p.domRestricted, false);
  assert.equal(p.dowRestricted, false);
});

test("parses steps, ranges, and lists", () => {
  assert.deepEqual(parse("*/15 * * * *").minute, [0, 15, 30, 45]);
  assert.deepEqual(parse("0 9-17 * * *").hour, [9, 10, 11, 12, 13, 14, 15, 16, 17]);
  assert.deepEqual(parse("0,30 * * * *").minute, [0, 30]);
  assert.deepEqual(parse("0 0 * * 1-5").dayOfWeek, [1, 2, 3, 4, 5]);
});

test("resolves month and weekday name aliases", () => {
  assert.deepEqual(parse("0 0 1 JAN,DEC *").month, [1, 12]);
  assert.deepEqual(parse("0 0 * * MON-FRI").dayOfWeek, [1, 2, 3, 4, 5]);
});

test("folds day-of-week 7 to 0 (Sunday)", () => {
  assert.deepEqual(parse("0 0 * * 7").dayOfWeek, [0]);
  assert.deepEqual(parse("0 0 * * 0,7").dayOfWeek, [0]);
});

test("expands @macros", () => {
  assert.equal(parse("@daily").source, "0 0 * * *");
  assert.deepEqual(parse("@hourly").minute, [0]);
});

test("stepped range a-b/n honors both bound and step", () => {
  assert.deepEqual(parse("0-30/10 * * * *").minute, [0, 10, 20, 30]);
});

test("rejects malformed expressions", () => {
  assert.throws(() => parse(""), CronError);
  assert.throws(() => parse("* * * *"), CronError);
  assert.throws(() => parse("60 * * * *"), CronError);
  assert.throws(() => parse("*/0 * * * *"), CronError);
  assert.throws(() => parse("5-2 * * * *"), CronError);
});
