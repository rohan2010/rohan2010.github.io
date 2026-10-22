import {
  circleRing,
  corners,
  extrude,
  insetPlan,
  knurl,
  lineOnTop,
  onTop,
  pathOf,
  planOutline,
  radialTicks,
  sideArc,
  sideMatrix,
  sideRing,
  sideSeam,
  sideTicks,
  slabOf,
  topTicks,
  type Flat,
  type Plan,
  type Point3,
} from "@/components/iso/iso-kit";
import { CARTRIDGES, NOTCHES } from "./model";
import { box, coilZ, onFaceX, onFaceY, prism, rollerY, roundRect } from "./shapes";
import {
  BASE,
  BASE_H,
  BEAM,
  BEAM_H,
  BEAM_TOP,
  BEAM_Y,
  BEAM_Z,
  BIN,
  BLADE_Z,
  BLOCK_H,
  BLOCK_L,
  BLOCK_R,
  CABINET,
  CABINET_H,
  CAB_FRONT,
  CARD_L,
  CARD_OUT,
  CARD_T,
  CARD_TOP_Z,
  CARD_W,
  CART_D,
  CART_H,
  CART_W,
  CHEEK_H,
  CHUTE_Y0,
  CHUTE_Y1,
  COIL_AT,
  DIAL_AT,
  DIAL_H,
  DIAL_R,
  DIAL_TICKS,
  DRAWERS,
  DRAWER_PROUD,
  DRAWER_X0,
  DRAWER_X1,
  FLAP_X0,
  FLAP_X1,
  FOOT_H,
  GAUGE_X,
  HOUSING_H,
  HOUSING_R,
  HOUSING_Z,
  HUB_H,
  LATCH_PIVOT,
  P,
  PLATE_EMPTY,
  POST,
  POSTS,
  RACK,
  RACK_H,
  RIBBON_X,
  ROD_L,
  ROD_R,
  ROLLERS,
  ROLLER_R,
  ROLLER_Z,
  SLOTS,
  STRIP_H,
  TRACK_X0,
  TRACK_X1,
  TRACK_Y,
  TRAY,
  TRAY_H,
  at,
} from "./view";

// Every static path of the bench, computed once at build time (server only).

const solid = (plan: Plan, z: number, h: number, steps = 4, bevel = 0) => slabOf(plan, z, h, P, steps, bevel);
const cyl = (cx: number, cy: number, r: number, z: number, h: number, steps = 32) => extrude(circleRing(cx, cy, r, steps), z, h, P, { convex: true });
const ring = (cx: number, cy: number, r: number, z: number, steps = 32) => onTop(circleRing(cx, cy, r, steps), z, P, true);
const seg = (a: Point3, b: Point3) => pathOf([at(a), at(b)]);
const join = (paths: string[]) => paths.filter(Boolean).join("");
const plan = (x0: number, y0: number, x1: number, y1: number, r = 0.6): Plan => ({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r });
const depth = ([x, y]: Flat) => x * Math.cos((50 * Math.PI) / 180) + y * Math.sin((50 * Math.PI) / 180);
const byDepth = <T extends Flat>(points: T[]) => [...points].sort((a, b) => depth(a) - depth(b));

/* ---------------- Base ---------------- */

const FEET = byDepth(corners(BASE, 22));
const BASE_SCREWS = corners(BASE, 9);
const LABEL: Plan = plan(-250, 33, -196, 47, 1.5);
const STRIP: Plan = plan(-190, 49, 152, 55, 0.8);
const STRIP_TICKS = topTicks(STRIP.x + 3, STRIP.x + STRIP.w - 3, 5, 5, STRIP.y + 0.1, 0.6, [2.2, 4], P);

export const BASE_ART = {
  halo: solid(BASE, -BASE_H - FOOT_H, BASE_H).fill,
  feet: FEET.map(([x, y]) => [cyl(x, y, 8, -BASE_H - FOOT_H, 1.6, 36), cyl(x, y, 6.2, -BASE_H - FOOT_H + 1.6, FOOT_H - 1.6, 36)]),
  slab: solid(BASE, -BASE_H, BASE_H, 8, 1.6),
  groove: planOutline(insetPlan(BASE, 4.5), 0, P),
  screws: BASE_SCREWS.map(([x, y]) => at([x, y, 0])),
  screwRings: join(BASE_SCREWS.map(([x, y]) => ring(x, y, 2.2, 0, 16))),
  label: solid(LABEL, 0, 0.8, 4),
  labelLine: planOutline(insetPlan(LABEL, 1.6), 0.8, P),
  labelRule: join([0, 1, 2].map((row) => onTop([[LABEL.x + 8, LABEL.y + 4 + row * 2.6], [LABEL.x + (row === 1 ? 30 : row === 2 ? 38 : 44), LABEL.y + 4 + row * 2.6]], 0.8, P))),
  labelScrews: [at([LABEL.x + 3.6, LABEL.y + LABEL.d / 2, 0.8]), at([LABEL.x + LABEL.w - 3.6, LABEL.y + LABEL.d / 2, 0.8])],
  strip: solid(STRIP, 0, 0.6, 3),
  stripMinor: STRIP_TICKS.minor,
  stripMajor: STRIP_TICKS.major,
  stripZero: lineOnTop([0, STRIP.y + 0.1], [0, STRIP.y + STRIP.d - 0.1], 0.6, P),
  // The retry path, painted on the bench: from the return bin back to the start of the line.
  retryPath: pathOf([at([BIN.x, BIN.y + 5, 0]), at([30, BIN.y + 5, 0]), at([30, TRACK_Y + 2, 0])]),
};

/* ---------------- Memory cabinet ---------------- */

const CASE_TOP = CABINET_H;
const pullOf = (z: number, h: number) => {
  const mid = z + h / 2;
  const cx = (DRAWER_X0 + DRAWER_X1) / 2 + 4;
  const front = CAB_FRONT + DRAWER_PROUD;
  return {
    posts: [cx - 7, cx + 5].map((x) => box([x, front, mid - 1], [x + 2, front + 2.4, mid + 1], P)),
    bar: box([cx - 8, front + 2.4, mid - 1], [cx + 8, front + 3.6, mid + 1], P),
  };
};
const holderOf = (z: number, h: number) => {
  const mid = z + h / 2;
  const front = CAB_FRONT + DRAWER_PROUD;
  const half = Math.min(3, h / 2 - 1.6);
  return {
    frame: box([DRAWER_X0 + 3, front, mid - half], [DRAWER_X0 + 13, front + 0.6, mid + half], P),
    card: onFaceY(front + 0.6, roundRect(DRAWER_X0 + 4.4, mid - half + 1.2, DRAWER_X0 + 11.6, mid + half - 1.2, 0.5, 2), P),
  };
};

export const DRAWER_ART = DRAWERS.map(({ z, h }) => ({
  front: box([DRAWER_X0, CAB_FRONT, z], [DRAWER_X1, CAB_FRONT + DRAWER_PROUD, z + h], P),
  ...pullOf(z, h),
  holder: holderOf(z, h),
  rivets: [at([DRAWER_X0 + 1.4, CAB_FRONT + DRAWER_PROUD, z + h / 2]), at([DRAWER_X1 - 1.4, CAB_FRONT + DRAWER_PROUD, z + h / 2])],
}));

const CONNECTOR: Point3[] = [
  [RIBBON_X - 4, CAB_FRONT, 19.5],
  [RIBBON_X + 4, CAB_FRONT + 3, 25.5],
];

export const CABINET_ART = {
  halo: solid(insetPlan(CABINET, -2), 0, 0.1).fill,
  plinth: solid(insetPlan(CABINET, -2), 0, 2, 4, 0.6),
  case: solid(CABINET, 2, CASE_TOP - 2, 4, 1),
  band: sideSeam(CABINET, 22.5, P, 4) + sideSeam(CABINET, 38.5, P, 4),
  top: solid(insetPlan(CABINET, 3), CASE_TOP, 1.4, 4, 0.4),
  topScrews: corners(insetPlan(CABINET, 6)).map(([x, y]) => at([x, y, CASE_TOP + 1.4])),
  panel: onFaceY(CAB_FRONT, roundRect(DRAWER_X1 + 2.5, 4, CABINET.x + CABINET.w - 3, CASE_TOP - 4, 1, 3), P),
  connector: box(CONNECTOR[0]!, CONNECTOR[1]!, P),
  connectorPins: [-2, 0, 2].map((dx) => at([RIBBON_X + dx, CAB_FRONT + 3, 22.5])),
  connectorScrews: [at([RIBBON_X - 6, CAB_FRONT, 22.5]), at([RIBBON_X + 6, CAB_FRONT, 22.5])],
};

/* ---------------- Gantry (posts, beam) ---------------- */

const postPlan = (x: number): Plan => plan(x, BEAM_Y - POST / 2, x + POST, BEAM_Y + POST / 2, 1.2);
const RULE_FACE = BEAM.y + BEAM.d;
const BEAM_TICKS = sideTicks(BEAM.x + 8, BEAM.x + BEAM.w - 8, 4, 5, RULE_FACE, BEAM_TOP - 1.4, [1.8, 3.6], P);

export const GANTRY_ART = {
  posts: POSTS.map((x) => {
    const p = postPlan(x);
    return {
      foot: solid(insetPlan(p, -3), 0, 2.4, 4, 0.5),
      footScrews: [at([p.x - 1.4, p.y + POST / 2, 2.4]), at([p.x + POST + 1.4, p.y + POST / 2, 2.4])],
      collar: solid(insetPlan(p, -1.2), 2.4, 4, 4, 0.4),
      post: solid(p, 6.4, BEAM_Z - 6.4 - 4, 4),
      band: sideSeam(p, 40, P, 4),
      cap: solid(insetPlan(p, -1.2), BEAM_Z - 4, 4, 4, 0.4),
    };
  }),
  beam: solid(BEAM, BEAM_Z, BEAM_H, 4, 0.8),
  ruleBase: sideSeam(BEAM, BEAM_TOP - 1.4, P, 4),
  ruleMinor: BEAM_TICKS.minor,
  ruleMajor: BEAM_TICKS.major,
  stops: [SLOTS[0]! - 16, 14].map((x) => solid(plan(x, BEAM.y - 0.6, x + 4, BEAM.y + BEAM.d + 0.6, 0.8), BEAM_TOP, 3, 3, 0.3)),
  stopScrews: [SLOTS[0]! - 14, 16].map((x) => at([x, BEAM_Y, BEAM_TOP + 3])),
  beamScrews: POSTS.map((x) => at([x + POST / 2, BEAM_Y, BEAM_TOP])),
};

/* ---------------- Cartridges (built at the origin, bottom at z 0) ---------------- */

const CART: Plan = plan(-CART_W / 2, -CART_D / 2, CART_W / 2, CART_D / 2, 1.4);
const notchPlan = (row: number): Plan => plan(-2, -CART_D / 2 + 4 + row * 8, 2, -CART_D / 2 + 8 + row * 8, 0.8);

export const CART_HIT = solid(plan(-CART_W / 2 - 4, -CART_D / 2 - 2, CART_W / 2 + 4, CART_D / 2 + 2, 2), -2, CART_H + 8).fill;

export const CARTRIDGE_ART = CARTRIDGES.map((_, index) => ({
  strip: solid(plan(-3, -CART_D / 2 + 3, 3, CART_D / 2 - 3, 0.6), 0, STRIP_H, 3),
  shell: solid(CART, STRIP_H, CART_H - STRIP_H, 4, 0.5),
  grip: join([3, 4.6, 6.2].map((down) => sideSeam(CART, CART_H - down, P, 4))),
  label: sideSeam(CART, STRIP_H + 4, P, 4),
  notches: NOTCHES[index]!.flatMap((on, row) => (on ? [planOutline(notchPlan(row), CART_H, P, 3)] : [])),
  marks: NOTCHES[index]!.flatMap((on, row) => (on ? [] : [at([0, -CART_D / 2 + 6 + row * 8, CART_H])])),
}));

/* ---------------- Rack ---------------- */

const CHEEK_BACK: Plan = plan(RACK.x, RACK.y, RACK.x + RACK.w, RACK.y + 4, 1);
const CHEEK_FRONT: Plan = plan(RACK.x, RACK.y + RACK.d - 4, RACK.x + RACK.w, RACK.y + RACK.d, 1);
const DIVIDERS = [...SLOTS.map((x) => x - 10), SLOTS[SLOTS.length - 1]! + 10];
const CHEEK_TOP = RACK_H + CHEEK_H;

export const RACK_ART = {
  base: solid(RACK, 0, RACK_H, 4, 0.6),
  floorLine: planOutline(plan(RACK.x + 3, RACK.y + 5, RACK.x + RACK.w - 3, RACK.y + RACK.d - 5, 1), RACK_H, P),
  back: solid(CHEEK_BACK, RACK_H, CHEEK_H, 3, 0.5),
  front: solid(CHEEK_FRONT, RACK_H, CHEEK_H, 3, 0.5),
  frontSeam: sideSeam(CHEEK_FRONT, RACK_H + 5, P, 3),
  dividers: DIVIDERS.map((x) => solid(plan(x - 1, RACK.y + 4, x + 1, RACK.y + RACK.d - 4, 0.4), RACK_H, 6, 2)),
  cheekScrews: [CHEEK_BACK, CHEEK_FRONT].flatMap((cheek) => [RACK.x + 3, RACK.x + RACK.w - 3].map((x) => at([x, cheek.y + 2, CHEEK_TOP]))),
  // Two detent plungers on the front cheek: a coil round a pin, under a cap.
  detents: [RACK.x + 8, RACK.x + RACK.w - 8].map((x) => ({
    coil: coilZ(x, CHEEK_FRONT.y + 2, 1.3, CHEEK_TOP, CHEEK_TOP + 3.6, 4, P, 14),
    pin: cyl(x, CHEEK_FRONT.y + 2, 0.5, CHEEK_TOP, 4, 10),
    cap: cyl(x, CHEEK_FRONT.y + 2, 1.7, CHEEK_TOP + 3.6, 1, 18),
    seat: ring(x, CHEEK_FRONT.y + 2, 1.9, CHEEK_TOP, 18),
  })),
  // A short index mark on the front cheek's top under each slot.
  slotMarks: join(SLOTS.map((x) => lineOnTop([x, CHEEK_FRONT.y], [x, CHEEK_FRONT.y + 4], CHEEK_TOP, P))),
};

/* ---------------- Socket ---------------- */

const LEFT_TOP = BLOCK_H;
export const SOCKET_ART = {
  halo: solid(plan(-24, -24, 24, 32, 3), 0, 0.1).fill,
  left: solid(BLOCK_L, 0, BLOCK_H, 4, 0.8),
  leftSeam: sideSeam(BLOCK_L, 6, P, 4),
  railL: solid(plan(-8.4, BLOCK_L.y, -6, BLOCK_L.y + BLOCK_L.d, 0.4), LEFT_TOP, 1.4, 2),
  pins: Array.from({ length: 9 }, (_, index) => at([-13, -16 + index * 4, LEFT_TOP])),
  pinRow: lineOnTop([-13, BLOCK_L.y], [-13, BLOCK_L.y + BLOCK_L.d], LEFT_TOP, P),
  screwsL: [at([-19, -19, LEFT_TOP]), at([-19, 19, LEFT_TOP])],
  boss: cyl(COIL_AT[0], COIL_AT[1], 3.6, 0, 1, 28),
  pin: cyl(COIL_AT[0], COIL_AT[1], 0.9, 1, PLATE_EMPTY - 1, 12),
  right: solid(BLOCK_R, 0, BLOCK_H, 4, 0.8),
  rightSeam: sideSeam(BLOCK_R, 6, P, 4),
  railR: solid(plan(6, BLOCK_R.y, 8.4, BLOCK_R.y + BLOCK_R.d, 0.4), LEFT_TOP, 1.4, 2),
  screwsR: [at([19, 19, LEFT_TOP]), at([11, 19, LEFT_TOP])],
  socketConnector: solid(plan(RIBBON_X - 4, -20.5, RIBBON_X + 4, -14, 0.8), LEFT_TOP, 4, 3, 0.3),
  // The status window on the +x face shows the seated model's key-notch pattern.
  window: onFaceX(BLOCK_R.x + BLOCK_R.w, roundRect(-9, 11, 9, 18, 1, 3), P),
  windowInner: onFaceX(BLOCK_R.x + BLOCK_R.w, roundRect(-8, 11.8, 8, 17.2, 0.6, 3), P),
  windowDots: NOTCHES.map((pattern) => pattern.map((on, row) => ({ on, at: at([BLOCK_R.x + BLOCK_R.w, -6 + row * 4, 14.5]) }))),
  label: sideMatrix([BLOCK_R.x + BLOCK_R.w, 21], 12.9, P, "right"),
  exit: onFaceX(BLOCK_R.x + BLOCK_R.w, roundRect(-11, 6, 11, 9.6, 1, 3), P),
  latchBoss: sideRing(LATCH_PIVOT, 2.4, "y", P, 24),
  latchPin: at(LATCH_PIVOT),
  latchStop: box([3, LATCH_PIVOT[1], LATCH_PIVOT[2] - 3.6], [6.6, LATCH_PIVOT[1] + 1.4, LATCH_PIVOT[2] - 1.8], P),
};

/* ---------------- Picker: carriage, arm, plunger (built over x = 0) ---------------- */

export const CARRIAGE_ART = {
  bushings: [-7, 4].map((x) => solid(plan(x, BEAM.y - 1, x + 3, BEAM.y + BEAM.d + 1, 0.6), BEAM_TOP, 2, 2)),
  body: solid(plan(-10, BEAM.y - 2, 10, BEAM.y + BEAM.d + 2, 1.6), BEAM_TOP + 2, 6, 4, 0.6),
  screws: corners(plan(-10, BEAM.y - 2, 10, BEAM.y + BEAM.d + 2), 2.6).map(([x, y]) => at([x, y, BEAM_TOP + 8])),
  rider: box([-1.4, BEAM.y + BEAM.d + 2, BEAM_Z + 3], [1.4, BEAM.y + BEAM.d + 3, BEAM_TOP + 2], P),
  riderTick: seg([0, BEAM.y + BEAM.d + 3, BEAM_TOP + 1.8], [0, BEAM.y + BEAM.d + 3, BEAM_Z + 3.2]),
  arm: solid(plan(-3, BEAM.y + BEAM.d + 1, 3, -HOUSING_R + 0.6, 1), BEAM_TOP + 1.5, 5, 3, 0.4),
  armScrews: [at([0, BEAM.y + BEAM.d + 4, BEAM_TOP + 6.5]), at([0, -HOUSING_R - 3, BEAM_TOP + 6.5])],
  collar: cyl(0, 0, HOUSING_R + 0.9, HOUSING_Z, 2.6, 36),
  housing: cyl(0, 0, HOUSING_R, HOUSING_Z + 2.6, HOUSING_H - 5, 36),
  seams: join([HOUSING_Z + 9, HOUSING_Z + 12].map((z) => sideArc(0, 0, HOUSING_R, z, P, 24))),
  cap: cyl(0, 0, HOUSING_R + 0.9, HOUSING_Z + HOUSING_H - 2.4, 2.4, 36),
  knob: cyl(0, 0, 3.2, HOUSING_Z + HOUSING_H, 3.6, 28),
  knobKnurl: knurl(0, 0, 3.2, HOUSING_Z + HOUSING_H, HOUSING_Z + HOUSING_H + 3.6, 28, P),
  knobPointer: lineOnTop([-1.6, 0], [2.6, 0], HOUSING_Z + HOUSING_H + 3.6, P),
};

const HUB_Z = CART_H + 2;
export const PLUNGER_ART = {
  rod: cyl(0, 0, ROD_R, HUB_Z + HUB_H - 2, ROD_L, 16),
  rodMarks: join([6, 9].map((rise) => sideArc(0, 0, ROD_R, HUB_Z + HUB_H - 2 + rise, P, 12))),
  collar: cyl(0, 0, 2.8, HUB_Z + 1.6, 2.4, 24),
  bridge: solid(plan(-7.2, -5, 7.2, 5, 1), HUB_Z, 1.8, 3, 0.3),
  bridgeScrews: [at([-4.6, 0, HUB_Z + 1.8]), at([4.6, 0, HUB_Z + 1.8])],
  // Jaws are built closed on the cartridge; live opens them 1.6 each way.
  jawBack: solid(plan(-7.2, -4, -CART_W / 2, 4, 0.5), CART_H - 6, 8, 2),
  jawFront: solid(plan(CART_W / 2, -4, 7.2, 4, 0.5), CART_H - 6, 8, 2),
  jawPads: join([-1, 1].map((side) => onFaceX(side * (CART_W / 2 + 2.7), roundRect(-2.4, CART_H - 5, 2.4, CART_H - 1, 0.6, 2), P))),
};

/* ---------------- Eval line ---------------- */

const BED_Z = 3;
const RAIL_H = 8;
export const TRACK_ART = {
  bedA: solid(plan(TRACK_X0, -TRACK_Y, FLAP_X0, TRACK_Y, 0.6), 0, BED_Z, 2, 0.4),
  bedB: solid(plan(FLAP_X1, -TRACK_Y, TRACK_X1, TRACK_Y, 0.6), 0, BED_Z, 2, 0.4),
  pit: solid(plan(FLAP_X0, -TRACK_Y, FLAP_X1, TRACK_Y, 0.4), 0, 1, 2),
  railBack: solid(plan(TRACK_X0, -TRACK_Y - 3, TRACK_X1, -TRACK_Y, 0.8), 0, RAIL_H, 3, 0.4),
  railFrontA: solid(plan(TRACK_X0, TRACK_Y, FLAP_X0, TRACK_Y + 3, 0.8), 0, RAIL_H, 3, 0.4),
  railFrontB: solid(plan(FLAP_X1, TRACK_Y, TRACK_X1, TRACK_Y + 3, 0.8), 0, RAIL_H, 3, 0.4),
  railScrewsBack: [30, 70, 120, 150].map((x) => at([x, -TRACK_Y - 1.5, RAIL_H])),
  railScrewsFront: [30, 70, 120, 150].map((x) => at([x, TRACK_Y + 1.5, RAIL_H])),
  rollers: ROLLERS.map((x) => rollerY(x, ROLLER_Z, -TRACK_Y, TRACK_Y, ROLLER_R, P, 24)),
  axles: ROLLERS.map((x) => at([x, TRACK_Y + 3, ROLLER_Z])),
  pivot: seg([FLAP_X0, TRACK_Y - 0.6, 6.6], [FLAP_X1, TRACK_Y - 0.6, 6.6]),
};

// The return chute: a sloped trough from the flap's front edge down into the bin.
const chuteAt = (x: number, y: number) => {
  const share = (y - CHUTE_Y0) / (CHUTE_Y1 - CHUTE_Y0);
  return 5 - share * 4;
};
const wall = (x: number): Point3[] => [
  [x, CHUTE_Y0, chuteAt(x, CHUTE_Y0)],
  [x, CHUTE_Y1, chuteAt(x, CHUTE_Y1)],
  [x, CHUTE_Y1, 0],
  [x, CHUTE_Y0, 0],
];
export const CHUTE_ART = {
  floor: prism(
    [
      [FLAP_X0, CHUTE_Y0 - 2, chuteAt(0, CHUTE_Y0 - 2)],
      [FLAP_X1, CHUTE_Y0 - 2, chuteAt(0, CHUTE_Y0 - 2)],
      [FLAP_X1, CHUTE_Y1, chuteAt(0, CHUTE_Y1)],
      [FLAP_X0, CHUTE_Y1, chuteAt(0, CHUTE_Y1)],
    ],
    [0, 0, 1],
    P,
  ),
  wallBack: prism(wall(FLAP_X0 - 1.2), [1.2, 0, 0], P),
  wallFront: prism(
    wall(FLAP_X1).map(([x, y, z], index) => [x, y, index < 2 ? z + 4 : z] as Point3),
    [1.2, 0, 0],
    P,
  ),
  binFloor: solid(BIN, 0, 1.2, 3),
  binBack: solid(plan(BIN.x, BIN.y, BIN.x + BIN.w, BIN.y + 1.2, 0.4), 1.2, 4.8, 2),
  binLeft: solid(plan(BIN.x, BIN.y, BIN.x + 1.2, BIN.y + BIN.d, 0.4), 1.2, 4.8, 2),
  binFront: solid(plan(BIN.x, BIN.y + BIN.d - 1.2, BIN.x + BIN.w, BIN.y + BIN.d, 0.4), 1.2, 4.8, 2),
  binRight: solid(plan(BIN.x + BIN.w - 1.2, BIN.y, BIN.x + BIN.w, BIN.y + BIN.d, 0.4), 1.2, 4.8, 2),
};

const GATE_TOP = 16;
const UPRIGHT = (y0: number, y1: number) => solid(plan(GAUGE_X - 3, y0, GAUGE_X + 3, y1, 0.8), 0, GATE_TOP, 3, 0.4);
export const GAUGE_ART = {
  back: UPRIGHT(-TRACK_Y - 7, -TRACK_Y - 3.4),
  front: UPRIGHT(TRACK_Y + 3.4, TRACK_Y + 7),
  feet: [-1, 1].map((side) => solid(plan(GAUGE_X - 5, side < 0 ? -TRACK_Y - 9 : TRACK_Y + 3, GAUGE_X + 5, side < 0 ? -TRACK_Y - 3 : TRACK_Y + 9, 0.8), 0, 1.6, 3, 0.3)),
  bar: solid(plan(GAUGE_X - 3.4, -TRACK_Y - 7.4, GAUGE_X + 3.4, TRACK_Y + 7.4, 1), GATE_TOP, 3.4, 3, 0.5),
  barScrews: [-1, 1].map((side) => at([GAUGE_X, side * (TRACK_Y + 5.2), GATE_TOP + 3.4])),
  blade: box([GAUGE_X - 1, -TRACK_Y + 1, BLADE_Z], [GAUGE_X + 1, TRACK_Y - 1, GATE_TOP], P),
};

const TRAY_WALL = 1.6;
export const TRAY_ART = {
  floor: solid(TRAY, 0, 2, 3, 0.4),
  back: solid(plan(TRAY.x, TRAY.y, TRAY.x + TRAY.w, TRAY.y + TRAY_WALL, 0.5), 2, TRAY_H - 2, 2),
  left: solid(plan(TRAY.x, TRAY.y, TRAY.x + TRAY_WALL, TRAY.y + TRAY.d, 0.5), 2, TRAY_H - 2, 2),
  front: solid(plan(TRAY.x, TRAY.y + TRAY.d - TRAY_WALL, TRAY.x + TRAY.w, TRAY.y + TRAY.d, 0.5), 2, TRAY_H - 2, 2),
  right: solid(plan(TRAY.x + TRAY.w - TRAY_WALL, TRAY.y, TRAY.x + TRAY.w, TRAY.y + TRAY.d, 0.5), 2, TRAY_H - 2, 2),
  frontScrews: [TRAY.x + 5, TRAY.x + TRAY.w - 5].map((x) => at([x, TRAY.y + TRAY.d - TRAY_WALL / 2, TRAY_H])),
  // Shipped cards already in the tray (live shows as many as have shipped).
  stack: [0, 1, 2, 3, 4].map((index) => solid(plan(TRAY.x + 7 - index * 0.6, -CARD_W / 2 + index * 0.4, TRAY.x + 7 + CARD_L - index * 0.6, CARD_W / 2 + index * 0.4, 1), 2 + index * (CARD_T + 0.1), CARD_T, 3)),
};

const [DX, DY] = DIAL_AT;
const DIAL_FACE = DIAL_H;
const DIAL_MARKS = radialTicks(DX, DY, DIAL_R - 2.2, DIAL_TICKS, 5, DIAL_FACE, [1.4, 2.8], P);
export const DIAL_ART = {
  base: solid(plan(DX - 13, DY - 13, DX + 13, DY + 13, 3), 0, 1.6, 4, 0.4),
  baseScrews: corners(plan(DX - 13, DY - 13, DX + 13, DY + 13), 2.4).map(([x, y]) => at([x, y, 1.6])),
  puck: cyl(DX, DY, DIAL_R, 1.6, DIAL_H - 1.6, 64),
  knurl: knurl(DX, DY, DIAL_R, DIAL_H - 2.6, DIAL_H, 72, P, 0.3),
  band: sideArc(DX, DY, DIAL_R, DIAL_H - 2.6, P, 40),
  bezel: ring(DX, DY, DIAL_R - 1.2, DIAL_FACE, 64),
  minor: DIAL_MARKS.minor,
  major: DIAL_MARKS.major,
  hubRing: ring(DX, DY, 1.4, DIAL_FACE + 0.1, 16),
};

/* ---------------- Rest paths for the card (subject) ---------------- */

export const CARD_PLAN = (cx: number): Plan => plan(cx - CARD_L / 2, -CARD_W / 2, cx + CARD_L / 2, CARD_W / 2, 1);
export const GHOST = planOutline(CARD_PLAN(CARD_OUT), CARD_TOP_Z + CARD_T, P, 3);

/* ---------------- Eval set: the curated cards the gauge is checked against ---------------- */

const FILE: Plan = plan(122, -84, 168, -50, 1.5);
const FILE_WALL = 1.4;
const FILE_H = 12;
const INDEX_CARDS = [128, 133, 138, 147, 152, 157, 162];
export const EVAL_SET_ART = {
  halo: solid(insetPlan(FILE, -1), 0, 0.1).fill,
  floor: solid(FILE, 0, 1.6, 3, 0.4),
  back: solid(plan(FILE.x, FILE.y, FILE.x + FILE.w, FILE.y + FILE_WALL, 0.5), 1.6, FILE_H - 1.6, 2),
  left: solid(plan(FILE.x, FILE.y, FILE.x + FILE_WALL, FILE.y + FILE.d, 0.5), 1.6, FILE_H - 1.6, 2),
  // Index cards stand across the box; two tall dividers with tabs split the set.
  cards: INDEX_CARDS.map((x) => box([x - 0.5, FILE.y + 2, 1.6], [x + 0.5, FILE.y + FILE.d - 2, FILE_H + 2.5], P)),
  dividers: [143].flatMap((x) => [
    box([x - 0.6, FILE.y + 2, 1.6], [x + 0.6, FILE.y + FILE.d - 2, FILE_H + 4], P),
    box([x - 0.6, FILE.y + FILE.d - 15, FILE_H + 4], [x + 0.6, FILE.y + FILE.d - 7, FILE_H + 6.5], P),
  ]),
  front: solid(plan(FILE.x, FILE.y + FILE.d - FILE_WALL, FILE.x + FILE.w, FILE.y + FILE.d, 0.5), 1.6, FILE_H - 1.6, 2),
  right: solid(plan(FILE.x + FILE.w - FILE_WALL, FILE.y, FILE.x + FILE.w, FILE.y + FILE.d, 0.5), 1.6, FILE_H - 1.6, 2),
  holder: box([FILE.x + 14, FILE.y + FILE.d, 4], [FILE.x + 32, FILE.y + FILE.d + 0.6, 9], P),
  slip: onFaceY(FILE.y + FILE.d + 0.6, roundRect(FILE.x + 15.2, 5.1, FILE.x + 30.8, 7.9, 0.5, 2), P),
  pull: box([FILE.x + 19, FILE.y + FILE.d, 10], [FILE.x + 27, FILE.y + FILE.d + 1.6, 11], P),
  rivets: [at([FILE.x + 2.4, FILE.y + FILE.d, 6.5]), at([FILE.x + FILE.w - 2.4, FILE.y + FILE.d, 6.5])],
};

/* ---------------- Gantry driver: a box at the back that drives the picker ---------------- */

const DRIVER: Plan = plan(-136, -102, -92, -76, 2);
const DRIVER_H = 14;
const DRIVER_FRONT = DRIVER.y + DRIVER.d;
export const DRIVER_ART = {
  halo: solid(insetPlan(DRIVER, -1), 0, 0.1).fill,
  body: solid(DRIVER, 0, DRIVER_H, 4, 0.8),
  lid: solid(insetPlan(DRIVER, 2), DRIVER_H, 1.2, 4, 0.3),
  lidScrews: corners(insetPlan(DRIVER, 4)).map(([x, y]) => at([x, y, DRIVER_H + 1.2])),
  vents: join([0, 1, 2, 3, 4].map((index) => onFaceY(DRIVER_FRONT, roundRect(DRIVER.x + 6 + index * 5, 4, DRIVER.x + 8.4 + index * 5, 10.5, 1, 2), P))),
  lamps: [0, 1, 2].map((index) => at([DRIVER.x + DRIVER.w - 12 + index * 3.6, DRIVER_FRONT, 9])),
  lampRing: onFaceY(DRIVER_FRONT, roundRect(DRIVER.x + DRIVER.w - 14.6, 7, DRIVER.x + DRIVER.w - 2.4, 11, 2, 3), P),
  plug: box([DRIVER.x + DRIVER.w - 11, DRIVER_FRONT, 2.2], [DRIVER.x + DRIVER.w - 5, DRIVER_FRONT + 2.4, 5.6], P),
};
export const DRIVER_CABLE = {
  from: at([DRIVER.x + DRIVER.w - 8, DRIVER_FRONT + 2.4, 3.9]),
  via: [at([-110, -66, 0.6]), at([-170, -54, 0.6]), at([-236, -44, 0.6])],
  to: at([POSTS[0]! + POST / 2, BEAM_Y + POST / 2 + 3, 1.2]),
};
