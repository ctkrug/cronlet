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
    "At 00:00, on Monday through Friday",
  );
});

test("describes 'every minute'", () => {
  assert.equal(new Cron("* * * * *").describe(), "Every minute");
});

test("describes an hour range with 'through'", () => {
  assert.equal(
    new Cron("0 9-17 * * *").describe(),
    "At minute 0 past hour 9 through 17",
  );
});

test("describes a minute list, not a range", () => {
  assert.equal(
    new Cron("0,30 14 * * *").describe(),
    "At every 30th minute past hour 14",
  );
});

test("describes an hour step with an ordinal", () => {
  assert.equal(new Cron("0 */3 * * *").describe(), "At minute 0 past every 3rd hour");
});

test("describes a stepped range a-b/n", () => {
  assert.equal(new Cron("0-30/10 * * * *").describe(), "At minute 0, 10, 20, and 30");
});

test("describes a day-of-month step", () => {
  assert.equal(
    new Cron("0 0 */2 * *").describe(),
    "At 00:00, on every 2nd day-of-month",
  );
});

test("describes weekday and month names", () => {
  assert.equal(
    new Cron("0 0 * JAN,JUL MON,WED,FRI").describe(),
    "At 00:00, on Monday, Wednesday, and Friday, in January and July",
  );
});

test("describes a month range with 'through'", () => {
  assert.equal(
    new Cron("15 10 * 3-5 *").describe(),
    "At 10:15, in March through May",
  );
});

test("joins both day fields with 'or' (the Vixie OR rule)", () => {
  assert.equal(
    new Cron("0 0 1 * 1").describe(),
    "At 00:00, on day-of-month 1 or Monday",
  );
});
