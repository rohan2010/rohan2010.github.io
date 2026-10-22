import type { Point3 } from "@/components/iso/iso-kit";
import type { Group, PartId } from "./layers";
import { DURATION, REST, progressOf, settleNow, step, type BenchInput, type BenchState, type Phase } from "./model";

// The four detail figures (design pass, section 5.2). Each is a cropped,
// server-rendered view of the same bench, frozen in a pose the bench's own
// state machine reaches: every pose below is made by stepping `model.ts` from
// its rest state with the same inputs the tour and the keyboard use.

export type DetailMotion = "retry-flow" | "pins";

export interface DetailSpec {
  id: string;
  fig: string;
  title: string;
  readout: string;
  caption: string;
  /** what the drawing shows, for assistive tech */
  label: string;
  /** parts drawn normally */
  focus: Group[];
  /** single parts drawn normally although their group is context */
  parts?: PartId[];
  /** neighbours inside the crop, drawn solid but faint */
  context: Group[];
  state: BenchState;
  /** the world point the crop is centred on */
  centre: Point3;
  motion?: DetailMotion;
}

/** Step the bench forward until it is `u` of the way through `phase`. */
function advanceTo(state: BenchState, input: BenchInput, phase: Phase, u: number): BenchState {
  let next = step(state, input, 0);
  for (let guard = 0; guard < 20000; guard++) {
    if (next.phase === phase && progressOf(next) >= u) return next;
    next = step(next, {}, Math.min(0.01, DURATION[phase as Exclude<Phase, "idle">] / 200));
  }
  throw new Error(`The bench never reached ${phase} at ${u}`);
}

// Fig 1.2: a card that comes out malformed once (Shift+Space), stopped with its
// bent corner against the no-go blade.
const HELD_AT_BLADE = advanceTo(REST, { run: { failures: 1 } }, "check", 0.85);

// Fig 1.3: card 2 fails once and passes on its retry, then card 3 passes.
const THREE_SHIPPED = settleNow(settleNow(REST, { run: { failures: 1 } }), { run: { failures: 0 } });

// Fig 1.4: a real swap (→ GPT-4o). Claude has gone back to the rack and the
// picker is carrying GPT-4o in over the empty socket, the last frame of `fetch`
// before it lowers. The tour never has two cartridges out at once, so the
// socket is empty here, and the vector drawer is shut: it opens only in `recall`.
const MID_SWAP = advanceTo(REST, { pick: 1 }, "fetch", 0.995);

export const DETAILS: Record<"field" | "research" | "work" | "fun", DetailSpec> = {
  field: {
    id: "fig-1-1",
    fig: "Fig 1.1",
    title: "The cartridge rack",
    readout: "4 slots · 1 out in the field",
    caption:
      "The cartridge rack at the left of the bench. Each model is a cartridge with its own key-notch pattern; slot one is empty because Claude is out on the bench, seated in the socket. A model starts being useful when it leaves the rack.",
    label:
      "Close-up of the bench's cartridge rack: a base plate between a back and a front cheek, four slots with detent springs, and three cartridges standing in their slots, each with its own key-notch pattern on top. The first slot is empty.",
    focus: ["rack"],
    context: ["base", "gantry", "socket", "cabinet", "picker"],
    state: REST,
    centre: [-192, 0, 12],
  },
  research: {
    id: "fig-1-2",
    fig: "Fig 1.2",
    title: "Go/no-go gauge",
    readout: "no-go · card held at the blade",
    caption:
      "The go/no-go gauge and, behind it, the eval-set card file it is checked against. A flat card passes under the blade; this one came out with a bent corner, so it stops at the blade and the no-go flap below it will tip it into the return chute.",
    label:
      "Close-up of the bench's go/no-go gauge: two uprights and a bar over the track with a blade hanging from it, the no-go flap in the track below, and an output card with a bent corner stopped against the blade. Behind it stands a card file of index cards with a divider, a label slip and a pull.",
    focus: ["gauge", "evalset"],
    parts: ["card"],
    context: ["base", "line", "chute", "tray", "dial"],
    state: HELD_AT_BLADE,
    centre: [130, -36, 8],
  },
  work: {
    id: "fig-1-3",
    fig: "Fig 1.3",
    title: "Ship or retry",
    readout: "3 shipped · 1 retried",
    caption:
      "The end of the eval line. Cards that pass roll on into the shipped tray and turn the counter; a card that fails drops down the return chute into the bin, and the dotted path painted on the bench carries it back to the start of the line to be made again.",
    label:
      "Close-up of the end of the bench's eval line: rails and rollers, the no-go flap and return chute into a bin, a dotted retry path painted on the bench from the bin back to the start of the line, the shipped tray holding three cards, and a counter dial whose needle points at three.",
    focus: ["line", "chute", "tray", "dial"],
    context: ["base", "gauge", "socket", "evalset"],
    state: THREE_SHIPPED,
    centre: [120, 14, 4],
    motion: "retry-flow",
  },
  fun: {
    id: "fig-1-4",
    fig: "Fig 1.4",
    title: "Memory, mid-swap",
    readout: "memory: namespace “site” · fetching GPT-4o",
    caption:
      "The memory cabinet behind the socket, in the middle of a swap: Claude is back in the rack and the picker is carrying GPT-4o in over the empty socket. The cabinet's three drawers and its ribbon to the socket stay exactly where they are; the memory doesn't change when the model does.",
    label:
      "Close-up of the bench's memory cabinet: a case on a plinth with three drawers of different depths, a connector on its front with a ribbon cable running to the socket. In front, the empty socket with its seat plate, coil spring and open latch, and above it the picker's jaws holding a cartridge on its way in.",
    focus: ["cabinet", "socket", "picker"],
    context: ["base", "gantry", "rack", "line"],
    state: MID_SWAP,
    centre: [-6, -40, 30],
    motion: "pins",
  },
};

/** One zoom for the set: every crop is this many hero viewBox units wide, at 4:3. */
export const CROP_W = 272;
export const CROP_H = (CROP_W * 3) / 4;
