import { test } from "node:test";
import assert from "node:assert/strict";
import { Cron } from "../src/index.js";

test("describes an every-N-minutes schedule", () => {
  assert.equal(new Cron("*/15 * * * *").describe(), "Every 15 minutes");
});

test("describes a fixed clock time", () => {
  assert.equal(new Cron("30 9 * * *").describe(), "At 09:30");
});

test("describes a weekday range", () => {
  assert.equal(
    new Cron("0 0 * * 1-5").describe(),
    "At 00:00, on Monday, Tuesday, Wednesday, Thursday, and Friday",
  );
});

test("describes 'every minute'", () => {
  assert.equal(new Cron("* * * * *").describe(), "Every minute");
});
