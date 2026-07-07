# Cronlet — Vision

## The problem

Cron expressions are everywhere — CI schedules, backup jobs, serverless triggers, database
maintenance — and almost nobody can read them at a glance. `*/15 9-17 * * 1-5` is precise and
completely opaque. Worse, the syntax hides real traps:

- **Step values** (`*/15`, `0-30/10`) that most hand-rolled parsers get subtly wrong.
- **Name aliases** (`JAN`–`DEC`, `MON`–`FRI`) and `7`-as-Sunday.
- **The day-of-month / day-of-week OR rule**: when both are set, a day matches if *either* does.
  This is the single most misunderstood corner of cron, and getting it wrong silently changes
  when your job runs.
- **DST**: computing "the next run" has to happen in local wall-clock time or it drifts.

Existing libraries either pull in dependencies, are large, or don't explain what an expression
*means* in words.

## Who it's for

- **Developers** who write and review cron schedules and want them to stop being write-only.
- **Anyone** who lands on the companion page to sanity-check a schedule ("does this really run
  Mondays?") without installing anything.
- **Bundle-conscious projects** (browser, edge/serverless) that need a scheduler without a
  dependency tree.

## The core idea

One small, correct, dependency-free module that does three things and does them well:

1. **Parse** a cron expression into a validated, inspectable structure.
2. **Schedule** — compute the next run time(s) and test whether a date matches, in local time,
   honoring the OR rule and DST.
3. **Describe** — turn any expression into a plain-English sentence.

Paired with a **static companion page** that makes all three visible and interactive, and a
**benchmark** proving the core is both smaller and competitive with `node-cron`.

## The wow moment

Open the page, paste any cron string, and it resolves **live**, with no button press, into:

1. a plain-English sentence,
2. the **next five run times**, and
3. a color-coded schematic of the five fields.

Type in the plain-English builder and it composes the cron string back. It's a two-way
Rosetta Stone for cron, entirely client-side.

## Key design decisions

- **Zero runtime dependencies.** The core is one small graph of files with no imports outside
  the standard library. Dev tooling (TypeScript, tsx) never ships.
- **Local-time scheduling.** `next()` advances real `Date` objects field by field, so month/day
  rollovers and DST are handled by the platform, not by us re-implementing a calendar.
- **OR rule is explicit.** `domRestricted` / `dowRestricted` flags are stored at parse time so
  the scheduler can apply the standard Vixie behavior without guessing.
- **Fail loudly on bad input.** Out-of-range values, wrong field counts, and zero steps throw
  `CronError` with a specific message rather than silently matching nothing.
- **Describer is data-driven**, not a lookup table of known strings — it reasons about the
  parsed field shapes so it generalizes.

## What "v1 done" looks like

- Core parses, schedules, and describes every documented syntax form, with tests that
  cross-check `next()` against `node-cron` on a representative expression set.
- A benchmark in the README comparing parse + next-time throughput and bundle size vs `node-cron`.
- A polished, responsive companion page (`site/`) implementing the wow moment above and the
  reverse English→cron builder, matching `docs/DESIGN.md`.
- Published to npm as ESM + type declarations; CI green on Node 18/20/22.
- The page deployable as a static bundle to `apps.charliekrug.com/cronlet`.
