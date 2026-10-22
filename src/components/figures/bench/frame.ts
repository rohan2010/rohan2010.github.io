import { onTop, pathOf, roundedPlan, type Point3, type SolidPaths } from "@/components/iso/iso-kit";
import { MAX_RETRIES, progressOf, type BenchState } from "./model";
import { box, coilZ, prism } from "./shapes";
import {
  BIN,
  CAB_FRONT,
  CARD_GAUGE,
  CARD_L,
  CARD_OUT,
  CARD_BORN,
  CARD_PAST,
  CARD_T,
  CARD_TOP_Z,
  CARD_W,
  CARRY_Z,
  CHEEK_H,
  COIL_AT,
  COIL_R,
  DIAL_AT,
  DIAL_H,
  DIAL_R,
  DIAL_TICKS,
  DRAWERS,
  DRAWER_X0,
  DRAWER_X1,
  FLAP_X0,
  FLAP_X1,
  LATCH_LEN,
  LATCH_PIVOT,
  P,
  PLATE_EMPTY,
  PLATE_T,
  RACK_H,
  RACK_Z,
  RECALL_OUT,
  SEAT_Z,
  SLOTS,
  SOCKET_X,
  TRACK_X0,
  TRACK_Y,
  TRAY,
  at,
} from "./view";

// Where every moving part is for a model state, and the few paths that are
// rebuilt each frame (the seat coil, the latch, the card, the flap, the open
// drawer's body and the counter's needle). Runs in the browser.

const clamp = (value: number, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const ease = (value: number) => {
  const u = clamp(value);
  return u * u * (3 - 2 * u);
};
/** Eased share of the window [a, b] that `u` has covered. */
const span = (u: number, a: number, b: number) => ease((u - a) / (b - a));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const RADIANS = Math.PI / 180;

export const CHEEK_TOP = RACK_H + CHEEK_H;
export const slotX = (index: number) => SLOTS[index]!;

export interface Picker {
  x: number;
  /** cartridge-bottom height the jaws are set for */
  grip: number;
  /** 0 closed on a cartridge, 1 open */
  open: number;
}

export interface CardPose {
  shown: boolean;
  /** centre along the track */
  x: number;
  y: number;
  /** card bottom */
  z: number;
  /** tilt about `pivot` (y, z), back edge up */
  tilt: number;
  pivot: [number, number];
  bent: boolean;
  alpha: number;
}

export interface Pose {
  picker: Picker;
  /** cartridge index → where its bottom is and which layer draws it */
  carts: { x: number; z: number; layer: "rack" | "socket" }[];
  plate: number;
  latch: number;
  drawer: number;
  card: CardPose;
  flap: number;
  ghost: number;
  stack: number;
  count: number;
  window: number | null;
}

const IDLE_PICKER: Picker = { x: SOCKET_X, grip: CARRY_Z, open: 1 };

function pickerOf(state: BenchState, u: number): Picker {
  switch (state.phase) {
    case "unseat": {
      const home = slotX(state.held ?? 0);
      let grip = CARRY_Z;
      if (u < 0.3) grip = mix(CARRY_Z, SEAT_Z, span(u, 0.1, 0.24));
      else if (u < 0.78) grip = mix(SEAT_Z, CARRY_Z, span(u, 0.3, 0.44));
      else grip = mix(CARRY_Z, RACK_Z, span(u, 0.78, 0.9));
      const open = u < 0.3 ? 1 - span(u, 0.24, 0.3) : span(u, 0.9, 1);
      return { x: mix(SOCKET_X, home, span(u, 0.44, 0.78)), grip, open };
    }
    case "fetch": {
      const start = state.from === null ? SOCKET_X : slotX(state.from);
      const fromZ = state.from === null ? CARRY_Z : RACK_Z;
      const target = slotX(state.next);
      let x = mix(start, target, span(u, 0.1, 0.34));
      if (u >= 0.68) x = mix(target, SOCKET_X, span(u, 0.68, 1));
      let grip = mix(fromZ, CARRY_Z, span(u, 0, 0.1));
      if (u >= 0.34) grip = mix(CARRY_Z, RACK_Z, span(u, 0.34, 0.46));
      if (u >= 0.54) grip = mix(RACK_Z, CARRY_Z, span(u, 0.54, 0.68));
      return { x, grip, open: 1 - span(u, 0.46, 0.54) };
    }
    case "seat": {
      let grip = mix(CARRY_Z, SEAT_Z, span(u, 0, 0.32));
      if (u >= 0.55) grip = mix(SEAT_Z, CARRY_Z, span(u, 0.55, 0.92));
      return { x: SOCKET_X, grip, open: span(u, 0.32, 0.42) };
    }
    default:
      return IDLE_PICKER;
  }
}

function cardOf(state: BenchState, u: number): CardPose {
  const flat = (x: number, z = CARD_TOP_Z): CardPose => ({ shown: true, x, y: 0, z, tilt: 0, pivot: [0, 0], bent: false, alpha: 1 });
  const bent = state.failing > 0 && state.retry < MAX_RETRIES;
  const inTray = (index: number): CardPose => ({ ...flat(TRAY.x + 7 + CARD_L / 2 - index * 0.6, 2 + index * (CARD_T + 0.1)), y: index * 0.4 });
  const plates = Math.min(4, state.shipped);
  switch (state.phase) {
    case "idle":
      return inTray(Math.min(4, Math.max(0, state.shipped - 1)));
    case "unseat":
    case "fetch":
    case "seat":
      return inTray(Math.min(4, Math.max(0, state.shipped - 1)));
    case "recall":
      return { ...flat(CARD_BORN), shown: false };
    case "generate":
      return { ...flat(mix(CARD_BORN, CARD_OUT, span(u, 0, 1))), bent };
    case "check": {
      if (bent) {
        const reach = span(u, 0, 0.62);
        const bump = u > 0.62 ? Math.sin(clamp((u - 0.62) / 0.2) * Math.PI) * 1.2 : 0;
        return { ...flat(mix(CARD_OUT, CARD_GAUGE, reach) - bump), bent };
      }
      return flat(mix(CARD_OUT, CARD_PAST, span(u, 0, 1)));
    }
    case "reject": {
      const pivot: [number, number] = [TRACK_Y - 0.6, 6.6];
      if (u < 0.5) {
        const tilt = 45 * span(u, 0, 0.28);
        const slide = 15 * span(u, 0.28, 0.5);
        return { shown: true, x: CARD_GAUGE, y: slide, z: CARD_TOP_Z, tilt, pivot, bent: true, alpha: 1 };
      }
      // Off the flap, down the chute, into the bin.
      const t = span(u, 0.5, 0.8);
      const binY = BIN.y + BIN.d / 2;
      const x = mix(CARD_GAUGE, BIN.x + BIN.w / 2, t);
      const y = mix(TRACK_Y + 4, binY, t);
      const z = mix(4.2, 1.2, t);
      const tilt = t < 0.5 ? mix(45, 9.5, t * 2) : mix(9.5, 0, (t - 0.5) * 2);
      return { shown: true, x, y, z, tilt, pivot: [y, z], bent: true, alpha: 1 - span(u, 0.84, 1) };
    }
    case "ship": {
      if (u < 0.55) return flat(mix(CARD_PAST, 158, span(u, 0, 0.55)));
      const land = inTray(plates);
      const t = span(u, 0.55, 1);
      const arc = Math.sin(t * Math.PI) * 3;
      return { ...land, x: mix(158, land.x, t), y: mix(0, land.y, t), z: mix(CARD_TOP_Z, land.z, t) + arc };
    }
  }
}

export function poseOf(state: BenchState): Pose {
  const u = progressOf(state);
  const picker = pickerOf(state, u);
  const carts: Pose["carts"] = SLOTS.map((x) => ({ x, z: RACK_Z, layer: "rack" }));
  if (state.seated !== null) carts[state.seated] = { x: SOCKET_X, z: SEAT_Z, layer: "socket" };
  if (state.phase === "seat") {
    const placed = u >= 0.32;
    carts[state.next] = { x: SOCKET_X, z: placed ? SEAT_Z : picker.grip, layer: "socket" };
  }
  if (state.held !== null && state.phase !== "seat") {
    const holding = state.phase === "unseat" ? u >= 0.3 && u < 0.9 : u >= 0.5;
    const index = state.held;
    if (state.phase === "unseat" && !holding && u < 0.3) carts[index] = { x: SOCKET_X, z: SEAT_Z, layer: "socket" };
    else if (state.phase === "unseat" && !holding) carts[index] = { x: slotX(index), z: RACK_Z, layer: "rack" };
    else carts[index] = { x: picker.x, z: picker.grip, layer: "socket" };
  }
  if (state.phase === "fetch") {
    const holding = u >= 0.5;
    const index = state.next;
    carts[index] = holding ? { x: picker.x, z: picker.grip, layer: "socket" } : { x: slotX(index), z: RACK_Z, layer: "rack" };
  }
  // In the rack, a cartridge below the cheek tops is drawn between the cheeks.
  for (const cart of carts) {
    const home = SLOTS.find((x) => Math.abs(x - cart.x) < 0.5);
    if (home !== undefined && cart.z < CHEEK_TOP + 1) cart.layer = "rack";
  }
  const inSocket = carts.find((cart) => cart.layer === "socket" && Math.abs(cart.x - SOCKET_X) < 0.5);
  const plate = inSocket ? clamp(inSocket.z - PLATE_T, SEAT_Z - PLATE_T, PLATE_EMPTY) : PLATE_EMPTY;
  let latch = state.seated !== null ? 1 : 0;
  if (state.phase === "unseat") latch = 1 - span(u, 0, 0.1);
  if (state.phase === "seat") latch = span(u, 0.42, 0.62);
  const drawer = state.phase === "recall" ? RECALL_OUT * (u < 0.5 ? span(u, 0, 0.4) : 1 - span(u, 0.6, 1)) : 0;
  const card = cardOf(state, u);
  let flap = 0;
  if (state.phase === "reject") flap = u < 0.7 ? 45 * span(u, 0, 0.28) : 45 * (1 - span(u, 0.7, 0.95));
  let ghost = 0;
  if (state.phase === "reject") ghost = span(u, 0.35, 0.6);
  if (state.phase === "generate" && state.retry > 0) ghost = 1 - span(u, 0.2, 0.9);
  const settled = state.phase === "idle" || state.phase === "unseat" || state.phase === "fetch" || state.phase === "seat";
  const stack = Math.min(4, settled ? Math.max(0, state.shipped - 1) : state.shipped);
  const count = state.shipped + (state.phase === "ship" ? span(u, 0.75, 1) : 0);
  const window = state.seated;
  return { picker, carts, plate, latch, drawer, card, flap, ghost, stack, count, window };
}

/* ---------------- Per-frame paths ---------------- */

export const coilOf = (plate: number) => coilZ(COIL_AT[0], COIL_AT[1], COIL_R, 1, plate, 4.5, P);

/** The latch lever on the right block's front face: 0 open (raised), 1 closed (across the throat). */
export function latchOf(closed: number): SolidPaths {
  const angle = (105 + 75 * closed) * RADIANS;
  const [px, py, pz] = LATCH_PIVOT;
  const ux = Math.cos(angle);
  const uz = Math.sin(angle);
  const half = 1.5;
  const tail = 3.2;
  const points: Point3[] = [
    [px - ux * tail - uz * half, py, pz - uz * tail + ux * half],
    [px + ux * LATCH_LEN - uz * half, py, pz + uz * LATCH_LEN + ux * half],
    [px + ux * LATCH_LEN + uz * half, py, pz + uz * LATCH_LEN - ux * half],
    [px - ux * tail + uz * half, py, pz - uz * tail - ux * half],
  ];
  return prism(points, [0, 1.2, 0], P);
}

const VECTOR = DRAWERS[1]!;
/** The vector drawer's body, showing as it slides out by `out`. */
export const drawerBodyOf = (out: number) =>
  out < 0.05 ? null : box([DRAWER_X0 + 1, CAB_FRONT - 0.5, VECTOR.z + 1], [DRAWER_X1 - 1, CAB_FRONT + out, VECTOR.z + VECTOR.h - 1.5], P);

const rotate = ([x, y, z]: Point3, tilt: number, [py, pz]: [number, number]): Point3 => {
  if (!tilt) return [x, y, z];
  const c = Math.cos(tilt * RADIANS);
  const s = Math.sin(tilt * RADIANS);
  const v = y - py;
  const w = z - pz;
  return [x, py + v * c + w * s, pz - v * s + w * c];
};

export interface CardPaths {
  body: SolidPaths;
  ear: SolidPaths | null;
  rules: string;
}

/** The output card (the lit subject), with a dog-eared front corner when it is malformed. */
export function cardPathsOf(card: CardPose): CardPaths {
  const hx = CARD_L / 2;
  const hy = CARD_W / 2;
  // Hidden inside the socket until it passes the exit slot.
  const cut = TRACK_X0 - card.x;
  const local = roundedPlan({ x: -hx, y: -hy, w: CARD_L, d: CARD_W, r: 1 }, 2).map(([x, y]) => [Math.max(x, cut), y] as [number, number]);
  const EAR = 5;
  let outline = local;
  if (card.bent) {
    outline = local.filter(([x, y]) => !(x > hx - EAR && y > hy - EAR));
    const at0 = outline.findIndex(([x, y]) => x >= hx - 0.01 && y < hy - EAR);
    outline.splice(at0 + 1, 0, [hx, hy - EAR], [hx - EAR, hy]);
  }
  const place = ([x, y]: [number, number], dz = 0): Point3 => rotate([card.x + x, card.y + y, card.z + dz], card.tilt, card.pivot);
  const normal = rotate([0, 0, CARD_T], card.tilt, [0, 0]);
  const body = prism(
    outline.map((point) => place(point)),
    normal,
    P,
  );
  let ear: SolidPaths | null = null;
  if (card.bent && cut < hx - EAR) {
    const fold = 40 * RADIANS;
    const lift = EAR * 0.62;
    const tip: [number, number] = [hx - lift * 0.5, hy - lift * 0.5];
    ear = prism(
      [place([hx, hy - EAR], CARD_T), place([hx - EAR, hy], CARD_T), place(tip, CARD_T + Math.sin(fold) * EAR * 0.9)],
      [normal[0] * 0.6, normal[1] * 0.6, normal[2] * 0.6],
      P,
    );
  }
  const rows = [
    [-hx + 3, 2],
    [-hx + 3, 6],
    [-hx + 3, 9],
  ];
  const rules = rows
    .map(([x0, length], row) => {
      const y = -hy + 4 + row * 3;
      const a = Math.max(x0!, cut + 1);
      const b = x0! + 9 + length!;
      return a < b ? pathOf([place([a, y], CARD_T), place([b, y], CARD_T)].map(at)) : "";
    })
    .join("");
  return { body, ear, rules };
}

/** The no-go flap, tipped `tilt` degrees about its front pivot. */
export function flapOf(tilt: number): SolidPaths {
  const pivot: [number, number] = [TRACK_Y - 0.6, 6.6];
  const points: Point3[] = [
    [FLAP_X0 + 0.4, -TRACK_Y + 0.6, 6],
    [FLAP_X1 - 0.4, -TRACK_Y + 0.6, 6],
    [FLAP_X1 - 0.4, TRACK_Y - 0.6, 6],
    [FLAP_X0 + 0.4, TRACK_Y - 0.6, 6],
  ].map((point) => rotate(point as Point3, tilt, pivot));
  return prism(points, rotate([0, 0, 1.2], tilt, [0, 0]), P);
}

/** The counter's needle for `count` shipped cards (20 to a turn). */
export function needleOf(count: number) {
  const angle = (count / DIAL_TICKS) * Math.PI * 2;
  const ux = Math.sin(angle);
  const uy = -Math.cos(angle);
  const [cx, cy] = DIAL_AT;
  const z = DIAL_H + 0.15;
  const point = (along: number, across: number) => at([cx + ux * along - uy * across, cy + uy * along + ux * across, z]);
  return pathOf([point(DIAL_R - 3.6, 0), point(0, 0.7), point(-2.6, 0.3), point(-2.6, -0.3), point(0, -0.7)], true);
}

/** A rule line on the card's top, for the ghost (where the retry will appear). */
export const ghostRule = onTop(
  [
    [CARD_OUT - CARD_L / 2 + 3, -CARD_W / 2 + 4],
    [CARD_OUT + 4, -CARD_W / 2 + 4],
  ],
  CARD_TOP_Z + CARD_T,
  P,
);

