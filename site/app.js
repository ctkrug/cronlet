// Cronlet companion page — live cron → English + next runs + field schematic,
// plus a reverse English→cron builder.
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
const copyBtn = document.getElementById("copy-btn");

function pad(n) {
  return String(n).padStart(2, "0");
}

function isFull(values, min, max) {
  return values.length === max - min + 1;
}

function relative(from, to) {
  const ms = to - from;
  const min = Math.round(ms / 60000);
  if (min < 1) return "now";
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

// ── Live translation ──────────────────────────────────────────────────────

function renderSchematic(parsed) {
  schematicEl.replaceChildren();
  for (const field of FIELDS) {
    const col = document.createElement("div");
    col.className = "field-col";
    col.tabIndex = 0;
    col.setAttribute("aria-label", `${field.name} field`);

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

    // Two-way field link: glow the column on hover/focus.
    const activate = () => col.classList.add("active");
    const deactivate = () => col.classList.remove("active");
    col.addEventListener("mouseenter", activate);
    col.addEventListener("mouseleave", deactivate);
    col.addEventListener("focus", activate);
    col.addEventListener("blur", deactivate);

    schematicEl.append(col);
  }
}

function renderRuns(job) {
  runlogEl.replaceChildren();
  const now = new Date();
  for (const run of job.next(5, now)) {
    const li = document.createElement("li");
    li.className = "roll";
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
  void input.offsetWidth; // reflow to restart the animation
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
    // Keep the last valid output visible; annotate the error inline.
    if (err instanceof CronError) {
      showError(err.message);
    } else {
      showError("could not parse expression");
    }
  }
}

// ── Copy affordance ───────────────────────────────────────────────────────

async function copyExpression() {
  const text = input.value.trim();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    input.select(); // clipboard API unavailable (e.g. file://) — fall back
  }
  input.classList.remove("pulse");
  void input.offsetWidth;
  input.classList.add("pulse");
  const label = copyBtn.querySelector(".copy-label");
  label.textContent = "copied";
  setTimeout(() => {
    label.textContent = "copy";
  }, 1200);
}

// ── Reverse builder: English → cron ───────────────────────────────────────

const bFreq = document.getElementById("b-freq");
const bStep = document.getElementById("b-step");
const bDow = document.getElementById("b-dow");
const bDom = document.getElementById("b-dom");
const bHour = document.getElementById("b-hour");
const bMin = document.getElementById("b-min");
const ctl = {
  step: document.getElementById("ctl-step"),
  dow: document.getElementById("ctl-dow"),
  dom: document.getElementById("ctl-dom"),
  hour: document.getElementById("ctl-hour"),
  min: document.getElementById("ctl-min"),
};
const minName = document.getElementById("min-name");
const builderPreview = document.getElementById("builder-preview");

function fillSelect(sel, from, to, pad2, selected) {
  for (let i = from; i <= to; i++) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = pad2 ? pad(i) : String(i);
    if (i === selected) opt.selected = true;
    sel.append(opt);
  }
}

fillSelect(bDom, 1, 31, false, 1);
fillSelect(bHour, 0, 23, true, 9);
fillSelect(bMin, 0, 59, true, 30);

/** Compose the cron expression the current builder state describes. */
function buildExpression() {
  const min = bMin.value;
  const hour = bHour.value;
  switch (bFreq.value) {
    case "everyMinute":
      return "* * * * *";
    case "everyNMin":
      return `*/${bStep.value} * * * *`;
    case "hourly":
      return `${min} * * * *`;
    case "daily":
      return `${min} ${hour} * * *`;
    case "weekly":
      return `${min} ${hour} * * ${bDow.value}`;
    case "monthly":
      return `${min} ${hour} ${bDom.value} * *`;
    default:
      return "* * * * *";
  }
}

/** Show only the controls the chosen frequency needs. */
function updateBuilderVisibility() {
  const f = bFreq.value;
  ctl.step.hidden = f !== "everyNMin";
  ctl.dow.hidden = f !== "weekly";
  ctl.dom.hidden = f !== "monthly";
  ctl.hour.hidden = !["daily", "weekly", "monthly"].includes(f);
  ctl.min.hidden = !["hourly", "daily", "weekly", "monthly"].includes(f);
  minName.textContent = f === "hourly" ? "minute past hour" : "minute";
}

function syncFromBuilder() {
  updateBuilderVisibility();
  const expr = buildExpression();
  builderPreview.textContent = expr;
  input.value = expr;
  update();
}

for (const el of [bFreq, bStep, bDow, bDom, bHour, bMin]) {
  el.addEventListener("change", syncFromBuilder);
}

// ── Wire up ───────────────────────────────────────────────────────────────

input.addEventListener("input", update);
copyBtn.addEventListener("click", copyExpression);
updateBuilderVisibility(); // set initial control visibility without touching the input
update();
