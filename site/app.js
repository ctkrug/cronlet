// Cronlet companion page — live cron → English + next runs + field schematic.
// Imports the compiled library from ./lib (produced by `npm run build:site`).
import { Cron, CronError } from "./lib/index.js";

const FIELDS = [
  { key: "minute", name: "minute", min: 0, max: 59 },
  { key: "hour", name: "hour", min: 0, max: 23 },
  { key: "dayOfMonth", name: "day-of-month", min: 1, max: 31 },
  { key: "month", name: "month", min: 1, max: 12 },
  { key: "dayOfWeek", name: "day-of-week", min: 0, max: 6 },
];

const input = document.getElementById("cron-input");
const errorEl = document.getElementById("cron-error");
const sentenceEl = document.getElementById("sentence");
const schematicEl = document.getElementById("schematic");
const runlogEl = document.getElementById("runlog");

function isFull(values, min, max) {
  return values.length === max - min + 1;
}

function relative(from, to) {
  const ms = to - from;
  const min = Math.round(ms / 60000);
  if (min < 60) return `in ${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 48) return `in ${hr}h`;
  return `in ${Math.round(hr / 24)}d`;
}

function fmt(d) {
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderSchematic(parsed) {
  schematicEl.replaceChildren();
  for (const field of FIELDS) {
    const col = document.createElement("div");
    col.className = "field-col";

    const label = document.createElement("div");
    label.className = "col-name";
    label.textContent = field.name;
    col.append(label);

    const chips = document.createElement("div");
    chips.className = "chips";
    const values = parsed[field.key];
    if (isFull(values, field.min, field.max)) {
      const chip = document.createElement("span");
      chip.className = "chip all";
      chip.textContent = "*";
      chips.append(chip);
    } else {
      for (const v of values.slice(0, 12)) {
        const chip = document.createElement("span");
        chip.className = "chip";
        chip.textContent = String(v);
        chips.append(chip);
      }
      if (values.length > 12) {
        const more = document.createElement("span");
        more.className = "chip all";
        more.textContent = `+${values.length - 12}`;
        chips.append(more);
      }
    }
    col.append(chips);
    schematicEl.append(col);
  }
}

function renderRuns(job) {
  runlogEl.replaceChildren();
  const now = new Date();
  for (const run of job.next(5, now)) {
    const li = document.createElement("li");
    const when = document.createElement("span");
    when.textContent = fmt(run);
    const rel = document.createElement("span");
    rel.className = "rel";
    rel.textContent = relative(now, run);
    li.append(when, rel);
    runlogEl.append(li);
  }
}

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
  input.classList.add("invalid");
  input.classList.remove("shake");
  // reflow to restart the animation
  void input.offsetWidth;
  input.classList.add("shake");
}

function clearError() {
  errorEl.hidden = true;
  input.classList.remove("invalid");
}

function update() {
  const expr = input.value.trim();
  try {
    const job = new Cron(expr);
    clearError();
    sentenceEl.textContent = job.describe();
    renderSchematic(job.parsed);
    renderRuns(job);
  } catch (err) {
    if (err instanceof CronError) {
      showError(err.message);
    } else {
      showError("could not parse expression");
    }
  }
}

input.addEventListener("input", update);
update();
