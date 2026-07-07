# Changelog

All notable changes to Cronlet are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Zero-dependency core: `parse`, `Cron`, `next`/`nextN`, `matches`, and `describe`.
- Cron syntax support: wildcards, ranges, lists, steps (`*/n`, `a-b/n`, `a/n`),
  `JAN`–`DEC` / `SUN`–`SAT` aliases, `7`-as-Sunday, and `@macro` shortcuts.
- Standard Vixie day-of-month **OR** day-of-week matching.
- Companion static page (`site/`): live cron → English, next-five run log, and a
  field schematic, in the blueprint art direction.
- CI on Node 18/20/22 and a full test suite.
