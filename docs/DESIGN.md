# Cronlet — Design

The companion page and this brief share one direction; the product (`site/`) and any landing
copy are one brand.

## 1. Aesthetic direction

**Cronlet is a technical blueprint:** an indigo drafting table under a fine cyan grid, where a
cron expression is dimensioned and annotated like a mechanical drawing — precise, monospaced,
lightly luminous. The five fields read as a labeled schematic; the next run times are stamped
like a build log.

This fits the audience (developers reading schedules) and, at the portfolio level, avoids the
"dark gray cards + one accent" default by committing to a real treatment: a **plotted grid
background**, drafting-annotation motifs, and a two-tone cyan/amber ink system rather than a
single accent on flat gray.

## 2. Tokens (actual values)

**Color**
| Role | Value |
| --- | --- |
| bg (drafting field) | `#0c1a2b` |
| surface-1 (panel) | `#11263c` |
| surface-2 (raised) | `#17324f` |
| grid line | `#1e3a5c` (major) / `rgba(78,201,224,0.06)` (minor) |
| text | `#e7f0f6` |
| text-muted | `#8fa9bf` |
| accent (blueprint cyan) | `#4ec9e0` |
| accent-support (annotation amber) | `#f4b860` |
| success | `#5fd6a0` |
| danger | `#ff7a7a` |

Never pure `#000`/`#fff`. Cyan carries structure and focus; amber marks the "active"/highlighted
value; the rest is the neutral indigo ramp.

**Type** — display **Space Grotesk** (600/700) for wordmark + headings; UI **Inter** (400/500)
for body and labels; **IBM Plex Mono** for the cron string, field tokens, and timestamps.
System fallbacks: `ui-sans-serif` and `ui-monospace`. Type scale ~1.25.

**Space** — 4/8px scale (4, 8, 12, 16, 24, 32, 48, 64). **Radius** — 10px panels, 6px chips,
4px field tokens. **Shadow/glow** — layered: `0 1px 0 rgba(255,255,255,.04)` inset hairline +
`0 12px 32px rgba(0,0,0,.45)` drop; the active field token gets a cyan glow
`0 0 0 1px #4ec9e0, 0 0 18px rgba(78,201,224,.35)`. **Motion** — UI 160–220ms ease-out; value
highlights and digit rolls 90–140ms ease-out; respect `prefers-reduced-motion`.

## 3. Layout intent

The **hero is the live translator**, taking ~65% of the viewport on desktop:

- **Top:** a large monospace cron input; below it, the **five-field schematic** — five labeled
  columns (minute · hour · day-of-month · month · day-of-week) with the matched values drawn as
  cyan chips over the grid, the active field glowing.
- **Left/main:** the **plain-English sentence**, large, in display type, updating live.
- **Right rail:** the **next five run times**, stamped in mono like a log, with relative deltas.
- **Below the hero:** the **English→cron builder** (styled selects/toggles) that writes the
  expression back into the input.

At **1440×900** it's a two-column composition (translator left, run-log rail right) over the
grid. At **390×844** it stacks: input → schematic → sentence → run times → builder, the grid
still filling the background, no dead margins.

## 4. Signature detail

The **field schematic reads as a drafting annotation**: each field column has a thin dimension
line and a mono label beneath, and the currently focused field lights cyan with its value chips
animating in — like values being plotted onto a blueprint. The wordmark **`cronlet`** sets the
`·` between segments as a small amber tick, echoing a crontab column separator.

## 5. Juice plan

Not a game, but the page earns motion where it clarifies:

- **Live retranslate:** on each keystroke the sentence cross-fades and the run-time stamps roll
  their digits (90–140ms), so a change *feels* computed, not reloaded.
- **Field highlight:** hovering/focusing a schematic column glows it cyan and underlines the
  matching substring in the raw expression (two-way link between token and field).
- **Valid/invalid feedback:** a malformed expression shakes the input once (skipped under
  reduced-motion) and shows an inline amber annotation instead of a crash.
- **Copy affordance:** copying the expression pulses the input border cyan and stamps "copied".
- No audio — a reference tool stays quiet by design (no SFX section applies).

## Brand assets

- **Favicon:** inline SVG data-URI — an amber `·` tick between two cyan blocks on the indigo
  field (the wordmark separator), never the default globe.
- **Wordmark:** `cronlet` in Space Grotesk 700, tight tracking, amber mid-dot.

Every later BUILD/QA run follows this file; change it only deliberately, in its own commit.
