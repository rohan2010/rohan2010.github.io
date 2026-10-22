import {
  corners,
  cylinder,
  dotGrid,
  insetPlan,
  iso,
  planOutline,
  sideSeam,
  slabOf,
  topTicks,
  type Flat,
} from "@/components/iso/iso-kit";
import { BASE, BASE_H, CARD_T, CARDS, FOOT_H, HOPPER, P, RULER, STACK_TOP, TOP, TRAY, TRAY_H, WALL, WALL_H } from "./view";

// Every static path, computed once at module load on the server. The client
// receives finished path strings inside the art elements, not this code.

export const BASE_ART = {
  halo: slabOf(BASE, 0, TOP, P).fill,
  feet: corners(insetPlan(BASE, 12)).map(([x, y]) => cylinder(x, y, 4, 0, FOOT_H, P, 24)),
  plate: slabOf(BASE, FOOT_H, BASE_H, P, 8, 0.8),
  groove: planOutline(insetPlan(BASE, 5), TOP, P),
  screws: corners(insetPlan(BASE, 9)).map(([x, y]) => iso([x, y, TOP], P)) as Flat[],
};

export const RULER_ART = {
  strip: slabOf(RULER, TOP, 1, P, 4),
  ticks: topTicks(RULER.x + 4, RULER.x + RULER.w - 4, 4, 5, RULER.y, TOP + 1, [3, RULER.d], P), // minors hang from the back edge; majors run edge to edge,
};

export const HOPPER_ART = {
  wall: slabOf(WALL, TOP, WALL_H, P, 4, 0.6),
  stack: slabOf(HOPPER, TOP, CARDS * CARD_T, P, 4),
  // one seam per card edge, wrapping every corner of the stack
  seams: Array.from({ length: CARDS - 1 }, (_, i) => sideSeam(HOPPER, TOP + (i + 1) * CARD_T, P, 4)).join(""),
  tray: slabOf(TRAY, TOP, TRAY_H, P, 4, 0.4),
  trayGroove: planOutline(insetPlan(TRAY, 4), TOP + TRAY_H, P, 4),
};

/** The moving card, built once at rest on top of the stack. */
export const CARD = {
  slab: slabOf(HOPPER, STACK_TOP, CARD_T, P, 4),
  // the punched holes: a 12-column × 3-row grid of dots on the card's top
  holes: dotGrid(HOPPER.x + 10, HOPPER.y + 10, 12, 3, 6, STACK_TOP + CARD_T, P),
};
