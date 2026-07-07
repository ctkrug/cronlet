---
title: "Building Cronlet: a 150-line cron parser that explains itself"
published: false
tags: typescript, cron, webdev, showdev
---

I keep pasting cron strings into config files and then, three weeks later,
squinting at `*/15 9-17 * * 1-5` trying to remember what it does. So I built
Cronlet: a tiny, dependency-free cron parser and scheduler for TypeScript, plus a
web page that turns any cron string into a plain-English sentence and back.

Live page: https://apps.charliekrug.com/cronlet/
Code: https://github.com/ctkrug/cronlet

The whole core is about 150 lines and ships with zero runtime dependencies. Here
are the two decisions that were more interesting than I expected.

## The day-of-month / day-of-week trap

Standard cron has a rule that surprises almost everyone. When you restrict *both*
the day-of-month field and the day-of-week field, a day matches if *either* one
matches, not both. So `0 0 13 * 5` does not mean "midnight on Friday the 13th". It
means "midnight on the 13th of every month, and also midnight on every Friday".

The catch is that the OR only applies when both fields are restricted. If one of
them is `*`, only the other is consulted. That means you cannot decide the rule
from the parsed value lists alone, because `*` on day-of-week parses to the same
`[0,1,2,3,4,5,6]` you would get from writing `0-6` explicitly. You have to
remember whether the field was literally `*` in the source.

So the parser records two extra booleans, `domRestricted` and `dowRestricted`,
captured before the fields are expanded:

```ts
const domOk = parsed.dayOfMonth.includes(d.getDate());
const dowOk = parsed.dayOfWeek.includes(d.getDay());
if (parsed.domRestricted && parsed.dowRestricted) return domOk || dowOk;
if (parsed.domRestricted) return domOk;
if (parsed.dowRestricted) return dowOk;
return true;
```

The describer surfaces the same rule in words, joining the two day clauses with
"or" so the behavior is visible instead of hidden.

## Describing an expression by its shape, not its text

The obvious way to write `describe()` is a big lookup: if the string is `0 0 * * *`
say "daily", and so on. That falls apart the moment someone types something you did
not hard-code.

Instead the describer looks at the *shape* of each parsed field. A field is either
full (every value, so `*`), a single value, an even step (0, 15, 30, 45 reaching the
top of the range), a contiguous range, or an arbitrary list. Each shape has one
phrasing:

- full minute and full hour becomes "Every minute"
- a single hour and single minute becomes an exact clock time, "At 09:30"
- an even step becomes "every 15th minute"
- a contiguous run of three or more becomes "Monday through Friday"

Because it reasons about structure, it handles expressions I never wrote a test for.
The step detection has one nice subtlety: a run only reads as "every N" if it
actually reaches the top of the field, so `0-20/2` on hours stays a list rather than
claiming "every 2nd hour", which would imply it runs past 20.

## Testing against a reference

For a parser, "looks right" is not enough. The test suite cross-checks Cronlet's
next-run times against [`cron-parser`](https://www.npmjs.com/package/cron-parser),
an independent, widely used implementation, across a spread of expressions. If the
two disagree on any run, the test fails. `cron-parser` is a dev dependency only; it
never ships. That oracle caught a real bug during the build: a field like `1/2/3`
with two slashes was being silently truncated to a valid-but-wrong schedule instead
of rejected.

## What I would do differently

Cron has extensions I skipped on purpose: `L` for last-day, `W` for nearest
weekday, `#` for the nth weekday. They are genuinely useful but they roughly double
the surface area, and the point of Cronlet was to stay small enough to read in one
sitting. If I add them, it will be behind a flag so the common path stays tiny.

If you want to read a cron string without leaving the browser, the page is here:
https://apps.charliekrug.com/cronlet/. Feedback welcome.
