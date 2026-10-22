import { boxCorners, fitProjection, type Plan, type Point3 } from "@/components/iso/iso-kit";

// EXAMPLE FIGURE (lead-owned reference; copy the pattern, don't edit).
// A card feed: a stack of punched cards in a hopper on a base plate; scroll
// feeds the top card out along x. World units ≈ 1 px; x right, y toward the
// viewer, z up. Azimuth 45°.

export const WIDTH = 480;
export const HEIGHT = 300;

export const BASE: Plan = { x: 0, y: 0, w: 200, d: 110, r: 5 };
export const FOOT_H = 4;
export const BASE_H = 8;
export const TOP = FOOT_H + BASE_H; // base top z

export const HOPPER: Plan = { x: 22, y: 30, w: 84, d: 46, r: 1.5 }; // the card stack
export const CARDS = 8;
export const CARD_T = 1.2;
export const STACK_TOP = TOP + CARDS * CARD_T;
export const WALL: Plan = { x: 18, y: 22, w: 92, d: 6, r: 1 }; // back wall of the hopper
export const WALL_H = 26;
export const RULER: Plan = { x: 14, y: 92, w: 172, d: 10, r: 1 }; // ruler strip along the front
export const TRAY: Plan = { x: 118, y: 30, w: 70, d: 46, r: 2 }; // exit tray
export const TRAY_H = 3;

/** How far the top card travels at progress 1 (x units). */
export const FEED = 86;

const PAD = 14;
const reach: Point3[] = [...boxCorners(BASE, 0, TOP), ...boxCorners(WALL, TOP, TOP + WALL_H)];
export const P = fitProjection(reach, WIDTH, HEIGHT, { pad: PAD });
