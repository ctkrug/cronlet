# Cronlet — Backlog

Epic/story breakdown for the build. Stories are `[ ]` until their acceptance criteria all
verify true. The **first story of Epic 1 is the wow moment** — the demo lands first.

---

## Epic 1 — The live cron translator (the wow moment)

The static companion page in `site/`. Depends on the core primitives shipped at scope
(`parse` / `next` / `describe`), so the demo is reachable immediately.

- [ ] **1.1 — WOW: live cron → English + next-5 + field schematic**
  - Typing any valid expression updates, with no button press, (a) a plain-English sentence,
    (b) the next five run times, and (c) a five-column field schematic — all within one frame.
  - `*/15 9-17 * * 1-5` shows "Every 15 minutes…", five ascending future timestamps, and cyan
    value chips in the minute/hour/day-of-week columns.
  - The page is one self-contained `site/` bundle using **relative** asset paths (opens via
    `file://` and works under a subpath) with no server or build step required to view.

- [ ] **1.2 — English → cron builder writes the expression back**
  - Choosing a frequency + time in the builder controls sets a valid expression into the input
    and re-runs the live translation.
  - Round-trip holds: builder-produced expression, when re-parsed, matches the builder's intent
    (e.g. "every day at 09:30" ⇒ `30 9 * * *`).

- [ ] **1.3 — Invalid input shows an inline annotation, never a crash**
  - Pasting `70 * * * *` or `* * * *` shows an inline amber error message and leaves the last
    valid output visible; no uncaught exception in the console.
  - Under `prefers-reduced-motion` the error shows without the shake animation.

- [ ] **1.4 — Design polish: blueprint direction, responsive, brand assets**
  - Page matches `docs/DESIGN.md` tokens/fonts; composes with no horizontal scroll or dead
    margins at 390 / 768 / 1440px.
  - Custom SVG favicon (not the default globe) and designed wordmark are present; every control
    has themed hover/focus-visible/active states.

## Epic 2 — Core correctness & edge cases

- [ ] **2.1 — Cross-check `next()` against `node-cron`**
  - A dev-only test iterates a representative expression set and asserts Cronlet's next-N times
    equal `node-cron`'s for each, across DST boundaries.
  - The check runs in CI (dev dependency only; the shipped package stays zero-dep).

- [ ] **2.2 — Full `describe()` coverage**
  - Ranges, lists, steps, `a-b/n`, day/month name output, and combined day+month clauses each
    produce a correct, readable sentence with ≥1 asserted test apiece.
  - Every `@macro` describes correctly (e.g. `@weekly` → "At 00:00, on Sunday").

- [ ] **2.3 — `prev()` previous-run computation**
  - `prev(expr, date)` returns the last matching instant strictly before `date`; `prev(n)`
    returns n descending matches.
  - `prev` then `next` round-trips to the same instant for a matching input.

- [ ] **2.4 — Hardened validation & messages**
  - Wrong field count, out-of-range values, `*/0`, reversed ranges, and unknown names each
    throw `CronError` with a field-specific message; all covered by tests.
  - `describe()` and `next()` never throw on any successfully parsed expression.

## Epic 3 — Benchmark, package & publish

- [ ] **3.1 — Benchmark vs `node-cron`**
  - A `bench/` script measures parse throughput and next-time throughput for both libraries and
    prints a table; results (and bundle-size delta) are pasted into the README.
  - Cronlet's core bundle size is reported and is a fraction of `node-cron`'s.

- [ ] **3.2 — Package build & publish config verified**
  - `npm run build` emits `dist/` with `index.js` + `index.d.ts`; `npm pack --dry-run` lists
    only `dist/`, `README.md`, `LICENSE`.
  - Importing the built package (`import { Cron } from "cronlet"`) type-checks and runs.

- [ ] **3.3 — Static site build to one deployable directory**
  - The page builds/copies into a single output dir suitable for `apps.charliekrug.com/cronlet`,
    with all asset references relative.
  - `site_build_dir` and `build_cmd` are recorded in STATUS.

- [ ] **3.4 — Docs polish**
  - README carries an API reference (Cron, parse, next, nextN, matches, describe, CronError)
    with runnable examples and the syntax table.
  - VISION's "v1 done" checklist is fully satisfied or the gaps are noted.

---

**Total stories:** 12
