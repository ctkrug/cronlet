# Changelog

All notable changes to Cronlet are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Zero-dependency core: `parse`, `Cron`, `next`/`nextN`, `prev`/`prevN`, `matches`,
  and `describe`.
- Cron syntax support: wildcards, ranges, lists, steps (`*/n`, `a-b/n`, `a/n`),
  `JAN`–`DEC` / `SUN`–`SAT` aliases, `7`-as-Sunday, and `@macro` shortcuts.
- Standard Vixie day-of-month **OR** day-of-week matching.
- `prev()`/`prevN()` previous-run computation, mirroring `next()`.
- Data-driven `describe()` that reasons about field shapes (full/single/step/range/list)
  and surfaces the day OR rule explicitly.
- Companion static page (`site/`): live cron → English, next-five run log, a field
  schematic, and a reverse **English → cron builder**, in the blueprint art direction.
- Correctness cross-check against `cron-parser` and a `parse`/`next` throughput
  benchmark (`npm run bench`), both dev-only.
- CI on Node 18/20/22 and a full test suite.

### Fixed

- Reject fields with multiple `/` or `-` separators (e.g. `1/2/3`, `1-5-9`) instead of
  silently truncating them to a different schedule.

### Changed

- Stop emitting source/declaration maps into the published package; `src/` is not shipped,
  so the maps only bloated the tarball (types still ship).
