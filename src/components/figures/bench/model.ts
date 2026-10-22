// The model bench, as a pure state machine (no DOM, no geometry).
//
// pick → seat → recall → generate → check → (pass → ship) | (fail → retry ≤ 2 → fallback)
//
// A picker swaps one cartridge (an AI model) for another; the memory cabinet
// answers whichever model is seated from the same namespace; every output card
// goes through a go/no-go gauge. The retry and fallback paths are the guardrails
// from BulkMagic: retry a malformed output, and fall back after two retries.
// Every number in the readout counts the figure's own cards. Nothing here
// claims a benchmark score.

export const CARTRIDGES = ["Claude", "GPT-4o", "Gemini", "Local LLM"] as const;
export type Cartridge = (typeof CARTRIDGES)[number];
/** Each cartridge has its own key-notch pattern in its top edge instead of a name. */
export const NOTCHES = [
  [1, 0, 0, 1],
  [0, 1, 1, 0],
  [1, 1, 0, 1],
  [0, 0, 1, 1],
];
export const NAMESPACE = "site";
export const MAX_RETRIES = 2;

export type Phase =
  | "idle"
  | "unseat" // picker lifts the seated cartridge and carries it home to its slot
  | "fetch" // picker goes to the new slot, lifts the cartridge and carries it over the socket
  | "seat" // lowers it into the socket; the latch closes and the seat spring compresses
  | "recall" // the vector drawer slides out and back: memory answers from the same namespace
  | "generate" // an output card leaves the socket onto the eval track
  | "check" // the card rolls into the go/no-go gauge
  | "reject" // it failed: the no-go flap tips it into the return chute
  | "ship"; // it passed (or fell back): it slides into the shipped tray

export const DURATION: Record<Exclude<Phase, "idle">, number> = {
  unseat: 2.3,
  fetch: 2.4,
  seat: 0.9,
  recall: 0.9,
  generate: 0.7,
  check: 1.0,
  reject: 1.1,
  ship: 0.8,
};

export type Outcome = "passed" | "fallback";

export interface BenchState {
  phase: Phase;
  /** seconds into the current phase */
  t: number;
  /** cartridge in the socket, or null while the picker holds it */
  seated: number | null;
  /** cartridge in the picker's jaws, or null */
  held: number | null;
  /** cartridge being fetched */
  next: number;
  /** where the picker starts a fetch: a rack slot, or null for over the socket */
  from: number | null;
  /** cards made so far (the current card's number once one is under way) */
  card: number;
  /** retries spent on the current card */
  retry: number;
  /** attempts of the current card still to fail (0 = it passes) */
  failing: number;
  /** cards that reached the shipped tray */
  shipped: number;
  /** how the last card ended */
  last: Outcome | null;
  /** a card is queued to run once the bench is free */
  queued: number | null;
  /** a swap is queued */
  want: number | null;
}

export interface BenchInput {
  /** seat this cartridge (a card then runs through, to show memory answering it) */
  pick?: number;
  /** run a card; `failures` attempts of it come out malformed (0 passes first time) */
  run?: { failures: number };
}

/** Rest pose: Claude seated, card 1 passed. */
export const REST: BenchState = {
  phase: "idle",
  t: 0,
  seated: 0,
  held: null,
  next: 0,
  from: null,
  card: 1,
  retry: 0,
  failing: 0,
  shipped: 1,
  last: "passed",
  queued: null,
  want: null,
};

const wrap = (index: number) => ((index % CARTRIDGES.length) + CARTRIDGES.length) % CARTRIDGES.length;

function begin(state: BenchState, phase: Phase): BenchState {
  return { ...state, phase, t: 0 };
}

/** From idle, start whatever is queued. */
function start(state: BenchState): BenchState {
  if (state.want !== null && state.want !== state.seated) {
    const next = state.want;
    const queued = state.queued ?? 0;
    const base = { ...state, next, want: null, queued };
    return state.seated === null ? begin({ ...base, held: null, from: null }, "fetch") : begin({ ...base, held: state.seated, seated: null }, "unseat");
  }
  if (state.queued !== null && state.seated !== null) {
    return begin({ ...state, want: null, queued: null, card: state.card + 1, retry: 0, failing: state.queued, last: null }, "recall");
  }
  return { ...state, want: null };
}

/** What happens when a phase finishes. */
function finish(state: BenchState): BenchState {
  switch (state.phase) {
    case "unseat":
      return begin({ ...state, from: state.held, held: null }, "fetch");
    case "fetch":
      return begin({ ...state, held: state.next }, "seat");
    case "seat":
      // The card the swap queued runs straight away.
      return begin({ ...state, held: null, seated: state.next, queued: null, card: state.card + 1, retry: 0, failing: state.queued ?? 0, last: null }, "recall");
    case "recall":
      return begin(state, "generate");
    case "generate":
      return begin(state, "check");
    case "check": {
      if (state.failing > 0 && state.retry < MAX_RETRIES) return begin(state, "reject");
      if (state.failing > 0) return begin({ ...state, last: "fallback" }, "ship");
      return begin({ ...state, last: "passed" }, "ship");
    }
    case "reject":
      // The guardrail retries: regenerate the same card.
      return begin({ ...state, retry: state.retry + 1, failing: state.failing - 1 }, "generate");
    case "ship":
      return start({ ...state, phase: "idle", t: 0, shipped: state.shipped + 1 });
    default:
      return state;
  }
}

/**
 * Advance the bench by `dt` seconds. Pure: returns a new state.
 * Time left over at the end of a phase carries into the next one, so a large
 * `dt` (or `Infinity`, for reduced motion) runs everything queued to rest.
 */
export function step(state: BenchState, input: BenchInput, dt: number): BenchState {
  let next: BenchState = { ...state };
  if (input.pick !== undefined) next.want = wrap(input.pick);
  if (input.run) next.queued = Math.max(0, Math.floor(input.run.failures));
  if (next.want !== null && next.queued === null) next.queued = 0;
  if (next.phase === "idle") next = start(next);
  let left = dt;
  for (let guard = 0; guard < 64 && next.phase !== "idle"; guard++) {
    const span = DURATION[next.phase];
    if (next.t + left < span) {
      next.t += left;
      return next;
    }
    left -= span - next.t;
    next = finish(next);
  }
  return next;
}

/** Progress through the current phase, 0..1. */
export const progressOf = (state: BenchState) => (state.phase === "idle" ? 1 : Math.min(1, state.t / DURATION[state.phase]));

export const busy = (state: BenchState) => state.phase !== "idle" || state.queued !== null || state.want !== null;

const nameOf = (index: number | null) => (index === null ? "" : CARTRIDGES[index]);

/** The card's live readout. Short, true, and only ever about the figure's own cards. */
export function readoutOf(state: BenchState): string {
  const card = `card ${state.card}`;
  const retry = state.retry ? ` · retry ${state.retry}` : "";
  switch (state.phase) {
    case "unseat":
      return `${nameOf(state.held)} back to the rack`;
    case "fetch":
      return `fetching ${nameOf(state.next)}`;
    case "seat":
      return `seating ${nameOf(state.next)}`;
    case "recall":
      return `${nameOf(state.seated)} · memory: namespace “${NAMESPACE}”`;
    case "generate":
      return `${card}${retry} · generating`;
    case "check":
      return `${card}${retry} · checking`;
    case "reject":
      return `${card}${retry} · failed · retrying`;
    case "ship":
    case "idle":
      if (state.last === "fallback") return `${card} · retry ${state.retry} failed · fallback`;
      if (state.retry) return `${card}${retry} · passed`;
      return `${nameOf(state.seated)} seated · memory: same namespace · ${card} passed`;
  }
}

/** Words for assistive tech, written when the reader's choice changes, not per frame. */
export function spokenOf(state: BenchState): string {
  const seated = state.seated === null ? "No model seated" : `${nameOf(state.seated)} seated`;
  let last = "passed the gauge";
  if (state.last === "fallback") last = `failed ${state.retry} retries and shipped the fallback`;
  else if (state.retry) last = `passed after ${state.retry} ${state.retry === 1 ? "retry" : "retries"}`;
  return `${seated}. Memory answers from the same namespace, “${NAMESPACE}”. ${state.shipped} ${state.shipped === 1 ? "card" : "cards"} shipped; card ${state.card} ${last}.`;
}

/** Run to rest at once (reduced motion). */
export const settleNow = (state: BenchState, input: BenchInput = {}) => step(state, input, Infinity);
