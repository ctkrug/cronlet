// Benchmark: Cronlet vs cron-parser for parse and next-time throughput.
// Run: `npm run bench`. Dev-only; neither the harness nor cron-parser ships.
import { Cron, parse, next } from "../src/index.js";
import { CronExpressionParser } from "cron-parser";

const EXPRESSIONS = [
  "*/15 9-17 * * 1-5",
  "0 0 * * *",
  "30 9 * * 1-5",
  "0 0 1 * *",
  "*/5 * * * *",
  "0 22 * * 1-5",
  "23 0-20/2 * * *",
  "0 4 8-14 * *",
];

/** Run `fn` for ~`ms` milliseconds; return operations per second. */
function measure(ms: number, fn: () => void): number {
  // Warm up so the JIT has compiled the hot path before we time it.
  for (let i = 0; i < 10_000; i++) fn();
  let ops = 0;
  const start = performance.now();
  while (performance.now() - start < ms) {
    for (let i = 0; i < 1_000; i++) fn();
    ops += 1_000;
  }
  const elapsed = (performance.now() - start) / 1000;
  return ops / elapsed;
}

function fmt(ops: number): string {
  return `${Math.round(ops).toLocaleString()} ops/s`;
}

const anchor = new Date(2026, 0, 1, 0, 0, 0);
let e = 0;
const nextExpr = () => EXPRESSIONS[e++ % EXPRESSIONS.length];

// Parse throughput ----------------------------------------------------------
const cronletParse = measure(1500, () => void parse(nextExpr()));
const cronParserParse = measure(1500, () => void CronExpressionParser.parse(nextExpr()));

// Next-time throughput (from a pre-parsed expression) -----------------------
const parsed = new Cron("*/15 9-17 * * 1-5").parsed;
let cursor = anchor;
const cronletNext = measure(1500, () => {
  cursor = next(parsed, cursor);
});
const it = CronExpressionParser.parse("*/15 9-17 * * 1-5", { currentDate: anchor });
const cronParserNext = measure(1500, () => void it.next());

// Report --------------------------------------------------------------------
const rows = [
  ["parse", fmt(cronletParse), fmt(cronParserParse)],
  ["next()", fmt(cronletNext), fmt(cronParserNext)],
];
const w0 = Math.max(...rows.map((r) => r[0].length), "operation".length);
const w1 = Math.max(...rows.map((r) => r[1].length), "cronlet".length);
const w2 = Math.max(...rows.map((r) => r[2].length), "cron-parser".length);
const line = (a: string, b: string, c: string) =>
  `| ${a.padEnd(w0)} | ${b.padStart(w1)} | ${c.padStart(w2)} |`;

console.log(line("operation", "cronlet", "cron-parser"));
console.log(`| ${"-".repeat(w0)} | ${"-".repeat(w1)} | ${"-".repeat(w2)} |`);
for (const r of rows) console.log(line(r[0], r[1], r[2]));
console.log(
  `\nparse: cronlet is ${(cronletParse / cronParserParse).toFixed(1)}× cron-parser` +
    `  ·  next(): ${(cronletNext / cronParserNext).toFixed(1)}×`,
);
