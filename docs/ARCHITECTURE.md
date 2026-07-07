# Cronlet — Architecture

A concise map of the codebase so a fresh session can orient fast. For *why*, see
[`VISION.md`](VISION.md); for the roadmap, [`BACKLOG.md`](BACKLOG.md); for the page's art
direction, [`DESIGN.md`](DESIGN.md).

## Shape

Cronlet is two artifacts from one core:

1. **The library** (`src/`) — a zero-dependency TypeScript module that parses, schedules, and
   describes cron expressions. Ships to npm as ESM + type declarations (`dist/`).
2. **The companion page** (`site/`) — a static, self-contained page that imports the compiled
   library and makes it interactive (the "wow moment").

## Modules (`src/`)

| File | Responsibility |
| --- | --- |
| `types.ts` | `ParsedCron` shape + the `CronError` class. No logic. |
| `fields.ts` | The five `FieldDef`s (bounds + name aliases), `@macro` table, `normalizeDow`. |
| `parse.ts` | `parseField` (one field → sorted int list) and `parse` (expression → `ParsedCron`). The only place that validates syntax. |
| `schedule.ts` | `matches`, `next`/`nextN`, `prev`/`prevN`. Walks real `Date`s in local time (DST-safe). |
| `describe.ts` | `describe` — turns a `ParsedCron` into a plain-English sentence by reasoning about field shapes (full / single / step / range / list). |
| `index.ts` | Public surface: re-exports the above + the `Cron` class wrapper. |

### Data flow

```
expression string
   │  parse()                     (parse.ts, validates → throws CronError)
   ▼
ParsedCron  { minute[], hour[], dayOfMonth[], month[], dayOfWeek[],
              domRestricted, dowRestricted, source }
   │                    │
   │ describe()         │ next()/nextN()/prev()/matches()
   ▼                    ▼
English sentence    Date(s)   (schedule.ts, local wall-clock)
```

`ParsedCron` is the single interchange format. Every field parses to its **explicit sorted list
of matching integers**, so scheduling and describing are pure set-membership questions — no
re-parsing downstream. `domRestricted`/`dowRestricted` capture whether each day field was
anything other than `*`, so `schedule.ts` can apply the Vixie **OR rule** (when *both* day
fields are restricted, a day matches if *either* does) without guessing.

## The page (`site/`)

- `index.html` — blueprint shell: cron input, five-field schematic, live sentence, run-log rail,
  English→cron builder. Relative asset paths only (served from a subpath).
- `styles.css` — the blueprint direction (tokens from `DESIGN.md`): plotted grid background,
  cyan/amber ink, themed control states.
- `app.js` — wires the compiled library (`site/lib/`, from `npm run build:site`) to the DOM:
  live translate on input, schematic render, run-log, error annotation, the builder.

The page imports `./lib/index.js`; `site/lib/` is a build artifact (git-ignored) produced by
`build:site`, which compiles `src/` with declarations off.

## Run / test / build

```sh
npm test           # node --test over test/*.test.ts via tsx (pure logic, no network)
npm run typecheck  # tsc --noEmit
npm run build      # emit dist/ (index.js + index.d.ts) for npm
npm run build:site # compile src/ into site/lib/ for the page
```

CI (`.github/workflows/ci.yml`) runs typecheck + tests + build on Node 18/20/22.
