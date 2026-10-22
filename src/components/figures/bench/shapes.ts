import { iso, pathOf, type Flat, type Point3, type Projection, type SolidPaths } from "@/components/iso/iso-kit";

// Small solids the kit doesn't have, drawn by the kit's own rules (paper fill,
// four side tones by facing, lighter top, crease on the near top edges).
// Shared by the server geometry and the per-frame client paths.

const RADIANS = Math.PI / 180;
const add = (a: Point3, b: Point3): Point3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Point3, b: Point3): Point3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: Point3, b: Point3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Point3, b: Point3): Point3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const unit = (a: Point3): Point3 => {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
};

export function viewOf(P: Projection): Point3 {
  const a = (P.azimuth ?? 45) * RADIANS;
  const e = (P.elevation ?? 30) * RADIANS;
  return [Math.cos(a) * Math.cos(e), Math.sin(a) * Math.cos(e), Math.sin(e)];
}

function hull(points: Flat[]): Flat[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (sorted.length < 3) return sorted;
  const turn = (o: Flat, a: Flat, b: Flat) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower: Flat[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && turn(lower[lower.length - 2]!, lower[lower.length - 1]!, point) <= 0) lower.pop();
    lower.push(point);
  }
  const upper: Flat[] = [];
  for (let index = sorted.length - 1; index >= 0; index--) {
    const point = sorted[index]!;
    while (upper.length >= 2 && turn(upper[upper.length - 2]!, upper[upper.length - 1]!, point) <= 0) upper.pop();
    upper.push(point);
  }
  return [...lower.slice(0, -1), ...upper.slice(0, -1)];
}

/**
 * A convex prism: `base` is a convex polygon in any plane, `up` the extrusion.
 * The face that looks at the viewer most is drawn as the top. Use it for plates
 * that tilt (the card on the flap, the flap, the chute) and plates on vertical faces.
 */
export function prism(base: Point3[], up: Point3, P: Projection): SolidPaths {
  const V = viewOf(P);
  const count = base.length;
  const top = base.map((point) => add(point, up));
  const centre = base.reduce<Point3>((sum, point) => add(sum, point), [0, 0, 0]).map((value) => value / count) as Point3;
  let capNormal = unit(cross(sub(base[1]!, base[0]!), sub(base[2]!, base[0]!)));
  if (dot(capNormal, up) < 0) capNormal = [-capNormal[0], -capNormal[1], -capNormal[2]];
  const upFacing = dot(capNormal, V) >= 0;
  const cap = upFacing ? top : base;
  const project = (point: Point3) => iso(point, P);
  const light: Point3 = [-Math.sin((P.azimuth ?? 45) * RADIANS), Math.cos((P.azimuth ?? 45) * RADIANS), 0];
  const buckets: string[][] = [[], [], [], []];
  const near: boolean[] = [];
  for (let index = 0; index < count; index++) {
    const a = base[index]!;
    const b = base[(index + 1) % count]!;
    let normal = unit(cross(sub(b, a), up));
    const mid: Point3 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    if (dot(normal, sub(mid, centre)) < 0) normal = [-normal[0], -normal[1], -normal[2]];
    const facing = dot(normal, V) > 1e-6;
    near.push(facing);
    if (!facing) continue;
    const lit = (dot(normal, light) + 1) / 2;
    const shade = Math.min(3, Math.max(0, Math.floor(lit * 4)));
    buckets[shade]!.push(pathOf([a, b, add(b, up), add(a, up)].map(project), true));
  }
  const outline = hull([...base, ...top].map(project));
  const crease: string[] = [];
  for (let index = 0; index < count; index++) {
    if (!near[index]) continue;
    crease.push(pathOf([cap[index]!, cap[(index + 1) % count]!].map(project)));
  }
  return {
    fill: pathOf(outline, true),
    outline: pathOf([...outline, outline[0]!]),
    crease: crease.join(""),
    top: pathOf(cap.map(project), true),
    shades: buckets.map((list) => list.join("")),
  };
}

/** A box from two corners, as a prism (for plates standing on vertical faces). */
export const box = (from: Point3, to: Point3, P: Projection) =>
  prism(
    [
      [from[0], from[1], from[2]],
      [to[0], from[1], from[2]],
      [to[0], to[1], from[2]],
      [from[0], to[1], from[2]],
    ],
    [0, 0, to[2] - from[2]],
    P,
  );

/** A closed outline on a vertical face at y = face (x, z pairs). */
export const onFaceY = (face: number, points: Flat[], P: Projection, closed = true) => pathOf(points.map(([x, z]) => iso([x, face, z], P)), closed);

/** A closed outline on a vertical face at x = face (y, z pairs). */
export const onFaceX = (face: number, points: Flat[], P: Projection, closed = true) => pathOf(points.map(([y, z]) => iso([face, y, z], P)), closed);

/** A rounded rectangle as (u, v) pairs, for outlines on faces. */
export function roundRect(u0: number, v0: number, u1: number, v1: number, r: number, steps = 4): Flat[] {
  const out: Flat[] = [];
  const corners: [number, number, number][] = [
    [u1 - r, v0 + r, -90],
    [u1 - r, v1 - r, 0],
    [u0 + r, v1 - r, 90],
    [u0 + r, v0 + r, 180],
  ];
  for (const [cu, cv, start] of corners) {
    for (let step = 0; step <= steps; step++) {
      const angle = (start + (90 * step) / steps) * RADIANS;
      out.push([cu + r * Math.cos(angle), cv + r * Math.sin(angle)]);
    }
  }
  return out;
}

/**
 * A roller lying along y between y0 and y1, axis at (x, z): a hull of its two
 * end circles, shaded as a cylinder on its side, with the near end face as the top.
 */
export function rollerY(x: number, z: number, y0: number, y1: number, r: number, P: Projection, steps = 24): SolidPaths {
  const V = viewOf(P);
  const nearY = V[1] >= 0 ? y1 : y0;
  const ring = (y: number) => Array.from({ length: steps }, (_, step) => {
    const angle = (step / steps) * Math.PI * 2;
    return [x + r * Math.cos(angle), y, z + r * Math.sin(angle)] as Point3;
  });
  const project = (point: Point3) => iso(point, P);
  const all = [...ring(y0), ...ring(y1)].map(project);
  const outline = hull(all);
  const end = ring(nearY).map(project);
  // Lower half of the body in the darker tone, the upper in the lighter.
  const lower: Point3[] = [];
  for (let step = 0; step <= steps / 2; step++) {
    const angle = Math.PI + (step / (steps / 2)) * Math.PI;
    lower.push([x + r * Math.cos(angle), y0, z + r * Math.sin(angle)]);
  }
  const lowerFar = lower.map(([px, , pz]) => [px, y1, pz] as Point3).reverse();
  return {
    fill: pathOf(outline, true),
    outline: pathOf([...outline, outline[0]!]),
    crease: pathOf([...end, end[0]!]),
    top: pathOf(end, true),
    shades: ["", pathOf(hull([...lower, ...lowerFar].map(project)), true), "", ""],
  };
}

/** A vertical coil spring around (cx, cy) from z0 to z1, split into the half behind its axis and the half in front. */
export function coilZ(cx: number, cy: number, r: number, z0: number, z1: number, turns: number, P: Projection, perTurn = 18) {
  const V = viewOf(P);
  const count = Math.max(2, Math.round(turns * perTurn));
  const back: Flat[][] = [];
  const front: Flat[][] = [];
  let run: Flat[] = [];
  let facing: boolean | null = null;
  for (let index = 0; index <= count; index++) {
    const share = index / count;
    const angle = share * turns * Math.PI * 2;
    const nx = Math.cos(angle);
    const ny = Math.sin(angle);
    const point = iso([cx + r * nx, cy + r * ny, z0 + (z1 - z0) * share], P);
    const near = nx * V[0] + ny * V[1] > 0;
    if (facing === null) facing = near;
    if (near !== facing) {
      run.push(point);
      (facing ? front : back).push(run);
      run = [point];
      facing = near;
      continue;
    }
    run.push(point);
  }
  if (run.length > 1) (facing ? front : back).push(run);
  return { back: back.map((points) => pathOf(points)).join(""), front: front.map((points) => pathOf(points)).join("") };
}
