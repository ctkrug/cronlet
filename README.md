# Cronlet

[![CI](https://github.com/ctkrug/cronlet/actions/workflows/ci.yml/badge.svg)](https://github.com/ctkrug/cronlet/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**A tiny, dependency-free cron-expression parser and scheduler for TypeScript — plus a
web page that turns a cron string into plain English and back.**

Cron syntax is deceptively hard. Step values (`*/15`), ranges (`1-5`), lists (`0,30`), the
month/day-of-week name aliases, and the notorious day-of-month **OR** day-of-week interplay all
hide in five terse fields. Cronlet handles them correctly in a **~150-line, zero-dependency
core** — and proves it: the schedule it computes matches `node-cron` field-for-field, in a
fraction of the bundle size.

```ts
import { Cron } from "cronlet";

const job = new Cron("*/15 9-17 * * 1-5");   // every 15 min, 9am–5pm, Mon–Fri

job.describe();          // "At every 15th minute past hour 9 through 17, on Monday through Friday"
job.next();              // → next matching Date after now
job.next(5);             // → the next 5 matching Dates
job.prev();              // → the previous matching Date before now
job.matches(new Date()); // → boolean
```

## Why Cronlet

- **Zero dependencies.** The whole scheduler is one small file. Drop it into a browser, a
  Cloudflare Worker, or a Node service without dragging a tree of transitive deps along.
- **Correct where it counts.** Steps, ranges, lists, `JAN`–`DEC` / `SUN`–`SAT` aliases,
  `7`-as-Sunday, and the day-of-month / day-of-week OR rule — the edge cases that trip up naive
  parsers — are covered by tests that cross-check against `node-cron`.
- **Explains itself.** `describe()` renders any expression as a plain-English sentence, so a
  cron string in a config file stops being a write-only riddle.
- **Tiny and fast.** Zero dependencies and a core that gzips to **~4.7 KB**, benchmarked
  against `cron-parser` (see below).

## Benchmark

`npm run bench` times parse and next-time throughput against
[`cron-parser`](https://www.npmjs.com/package/cron-parser) (an independent reference; Node 18,
your numbers will vary):

| operation | cronlet | cron-parser |
| --------- | ------------: | ----------: |
| parse     |  47,600 ops/s | 8,400 ops/s |
| next()    | 101,600 ops/s | 5,100 ops/s |

Cronlet is ~5.7× faster to parse and ~20× faster to compute the next run, at a fraction of the
size:

| library | gzipped core | runtime deps |
| --- | ---: | --- |
| **cronlet** | **~4.7 KB** | none |
| cron-parser | ~18 KB | `luxon` |

## The companion page

`site/` is a static, self-contained page — the **wow moment**: paste any cron expression and
watch it resolve, live, into (1) a plain-English sentence, (2) the next five run times, and
(3) a highlighted schematic of the five fields. Type in plain English and it builds the cron
back. No server, no build step to view — just open it.

## Cron syntax supported

```
┌───────────── minute        (0 - 59)
│ ┌───────────── hour        (0 - 23)
│ │ ┌───────────── day-of-month (1 - 31)
│ │ │ ┌───────────── month    (1 - 12 or JAN-DEC)
│ │ │ │ ┌───────────── day-of-week (0 - 6 or SUN-SAT, 7 = Sunday)
│ │ │ │ │
* * * * *
```

`*` any · `a-b` range · `a,b,c` list · `*/n` step · `a-b/n` stepped range ·
`JAN`–`DEC` / `SUN`–`SAT` names · `@hourly` `@daily` `@weekly` `@monthly` `@yearly` shortcuts.

## Install

```sh
npm install cronlet
```

Cronlet ships as ESM + type declarations. Node ≥ 18 or any modern browser.

## Development

```sh
npm install       # dev tooling only — the library itself has zero runtime deps
npm test          # run the test suite
npm run build     # emit dist/ (JS + .d.ts)
```

See [`docs/VISION.md`](docs/VISION.md) for the design, [`docs/BACKLOG.md`](docs/BACKLOG.md)
for the roadmap, and [`docs/DESIGN.md`](docs/DESIGN.md) for the companion page's art direction.

## License

MIT © Charlie Krug
