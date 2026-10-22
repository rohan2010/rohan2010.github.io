import { boxCorners, fitProjection, iso, type Flat, type Plan, type Point3 } from "@/components/iso/iso-kit";

// World layout of the model bench. Units are about 1 px of the real thing:
// x runs along the long front (rack → socket → eval line), y toward the
// viewer, z up. Azimuth 50° puts the long front (+y face) toward the reader.

export const WIDTH = 640;
export const HEIGHT = 373; // the drawn envelope (gantry beam to feet) is 1.72:1; see the design pass, section 2
export const AZIMUTH = 50;
const PAD = 8;

// Base plate on four feet.
export const BASE: Plan = { x: -262, y: -118, w: 494, d: 178, r: 10 };
export const BASE_H = 10;
export const FOOT_H = 5;

// Cartridge rack (left). Cartridges stand in slots along x, between a back and a front cheek.
export const RACK: Plan = { x: -238, y: -26, w: 92, d: 52, r: 2 };
export const RACK_H = 4;
export const CHEEK_H = 14;
export const SLOTS = [-222, -202, -182, -162];
export const CART_W = 9; // along x
export const CART_D = 36; // along y
export const CART_H = 26; // shell + contact strip
export const STRIP_H = 2;
export const RACK_Z = RACK_H; // cartridge bottom (contact strip) when in the rack

// Socket station (centre): two cheek blocks with a throat between them.
export const SOCKET_X = 0;
export const BLOCK_H = 20;
export const THROAT = 6; // half-width of the throat
export const BLOCK_L: Plan = { x: -22, y: -22, w: 16, d: 44, r: 1.5 };
export const BLOCK_R: Plan = { x: 6, y: -22, w: 16, d: 44, r: 1.5 };
export const SEAT_Z = 6; // cartridge bottom when seated (plate compressed)
export const PLATE_T = 1.5;
export const PLATE_EMPTY = 7; // seat plate bottom with no cartridge
export const PLATE_FULL = SEAT_Z - PLATE_T; // seat plate bottom with a cartridge pressing it
export const COIL_AT: Flat = [0, 27];
export const COIL_R = 2.6;
export const LATCH_PIVOT: Point3 = [17, BLOCK_R.y + BLOCK_R.d, 12];
export const LATCH_LEN = 15;

// Memory cabinet behind the socket: three drawers sized by role.
export const CABINET: Plan = { x: -34, y: -106, w: 56, d: 52, r: 2 };
export const CABINET_H = 52;
export const CAB_FRONT = CABINET.y + CABINET.d; // -54
export const DRAWERS = [
  { role: "source of truth", z: 3, h: 20 },
  { role: "vector", z: 25, h: 13 },
  { role: "cache", z: 40, h: 9 },
];
export const DRAWER_X0 = CABINET.x + 4;
export const DRAWER_X1 = 4;
export const DRAWER_PROUD = 1.5;
export const RECALL_OUT = 6;
export const RIBBON_X = 13;

// Picker gantry: two posts at the back, a beam along x, a carriage on top of it,
// and an arm reaching forward to a plunger housing over the line of slots.
export const POSTS = [-256, 32];
export const POST = 8;
export const BEAM_Y = -34;
export const BEAM: Plan = { x: -262, y: BEAM_Y - 4, w: 308, d: 8, r: 1.5 };
export const BEAM_Z = 74;
export const BEAM_H = 10;
export const BEAM_TOP = BEAM_Z + BEAM_H;
export const HOUSING_R = 5.2;
export const HOUSING_Z = 70;
export const HOUSING_H = 30;
export const ROD_R = 1.5;
export const ROD_L = 36;
export const HUB_H = 5; // jaws + bridge above the cartridge top
export const CARRY_Z = 32; // cartridge bottom while carried

// Eval line (right).
export const TRACK_Y = 12; // half-width between the rails
export const TRACK_X0 = 22;
export const TRACK_X1 = 160;
export const FLAP_X0 = 84;
export const FLAP_X1 = 108;
export const ROLLER_Z = 5;
export const ROLLER_R = 2.2;
export const ROLLERS = [32, 48, 64, 79, 122, 140];
export const CARD_TOP_Z = ROLLER_Z + ROLLER_R; // card bottom on the rollers
export const CARD_L = 22; // along x
export const CARD_W = 16; // along y
export const CARD_T = 1.2;
export const GAUGE_X = 112;
export const BLADE_Z = 10.5; // the no-go blade's lower edge; a flat card passes under it
export const CHUTE_Y0 = TRACK_Y + 2;
export const CHUTE_Y1 = 38;
export const BIN: Plan = { x: 82, y: 38, w: 28, d: 11, r: 1.5 };
export const TRAY: Plan = { x: 166, y: -17, w: 40, d: 34, r: 2 };
export const TRAY_H = 9;
export const DIAL_AT: Flat = [204, 36];
export const DIAL_R = 11;
export const DIAL_H = 6;
export const DIAL_TICKS = 20;

// Card stations along the track (card centre x).
export const CARD_BORN = TRACK_X0 - CARD_L / 2 - 1;
export const CARD_OUT = TRACK_X0 + CARD_L / 2 + 6;
export const CARD_GAUGE = GAUGE_X - 1 - CARD_L / 2; // a bent card stops here, its corner on the blade
export const CARD_PAST = 134;
export const CARD_TRAY = TRAY.x + TRAY.w / 2;

export const P = fitProjection(
  [
    ...boxCorners(BASE, -BASE_H - FOOT_H, 0),
    ...boxCorners(BEAM, BEAM_Z, BEAM_TOP),
    [SLOTS[0]!, 0, HOUSING_Z + HOUSING_H + 4],
    [SOCKET_X, 0, HOUSING_Z + HOUSING_H + 4],
  ],
  WIDTH,
  HEIGHT,
  { pad: PAD, azimuth: AZIMUTH },
);

export const at = (point: Point3) => iso(point, P);

const ORIGIN = at([0, 0, 0]);
const minus = (a: Flat, b: Flat): Flat => [a[0] - b[0], a[1] - b[1]];
export const EX = minus(at([1, 0, 0]), ORIGIN);
export const EY = minus(at([0, 1, 0]), ORIGIN);
export const EZ = minus(at([0, 0, 1]), ORIGIN);

const fine = (value: number) => Math.round(value * 100) / 100;

/** A screen translate for a world move. */
export const shift = (x = 0, y = 0, z = 0) =>
  `translate(${fine(EX[0] * x + EY[0] * y + EZ[0] * z)} ${fine(EX[1] * x + EY[1] * y + EZ[1] * z)})`;
