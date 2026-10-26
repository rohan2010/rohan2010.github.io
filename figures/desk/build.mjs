// Rohan's desk: the home page figure. Static drawing (step 1 of
// research/home-plan.md). Writes a preview page for review and an SVG module
// for the site: node figures/desk/build.mjs [--light]
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../kit/iso-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const theme = process.argv.includes("--light") ? "light" : "dark";

// One folder on the desk per project in src/content/projects (top of the stack = order 1, at most 5).
const PROJECTS_DIR = join(HERE, "..", "..", "src", "content", "projects");
const PROJECTS = readdirSync(PROJECTS_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => ({ slug: entry.name, ...JSON.parse(readFileSync(join(PROJECTS_DIR, entry.name, "project.json"), "utf8")) }))
  .sort((a, b) => a.order - b.order)
  .slice(0, 5);

const WIDTH = 1000;
const HEIGHT = 680;

// World: x to the right along the desk, y toward the viewer, z up. 1 unit ≈ 1 px of a real desk at 1:4.
const DESK = { x: -228, y: -112, w: 456, d: 228, r: 5 };
const TOP_H = 9;
const LEG_H = 62;

const MAT = { x: -138, y: 2, w: 230, d: 100, r: 6 };

const MON = { x: -100, y: -80, w: 200, d: 7, r: 2.4 };
const MON_FRONT = MON.y + MON.d;
const MON_Z0 = 58;
const MON_Z1 = 178;
const STAND = { x: -44, y: -98, w: 88, d: 44, r: 8 };
const NECK = { x: -8, y: -90, w: 16, d: 9, r: 2 };
const SCREEN = { x0: MON.x + 6, x1: MON.x + MON.w - 6, z0: MON_Z0 + 9, z1: MON_Z1 - 5, r: 1.6, depth: 1.2 };

const FRAME = { x: 100, y: -70, w: 74, d: 6, r: 1.6 };
const FRAME_FRONT = FRAME.y + FRAME.d;
const FRAME_Z1 = 74;
const PHOTO = { x0: FRAME.x + 6, x1: FRAME.x + FRAME.w - 6, z0: 7, z1: FRAME_Z1 - 6, r: 0.6, depth: 1.4 };

const POT = { x: -180, y: -72, r: 25 };
const POT_H = 38;

const KB = { x: -112, y: 22, w: 176, d: 62, r: 5 };
const KB_Z = 1.6;
const KB_TOP = 10;
const U = 10.4;
const KEYS_X = KB.x + 9;
const KEYS_Y = KB.y + 7;
const ROWS = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
  [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5],
  [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25],
  [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75],
  [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25, 1.25],
];
const ROW_H = [6.4, 6, 5.6, 5.2, 4.8];

const PAD = { x: 122, y: 42, angle: -16 };
const CLIP = { x: 168, y: -44, w: 52, d: 74, angle: 10 };
const FOLDERS = { x: -220, y: 30, w: 88, d: 62 };
const TICKETS = { x: -170, y: -24 };

const corners = [
  ...k.boxCorners(DESK, -TOP_H - LEG_H, 0),
  ...k.boxCorners(MON, 0, MON_Z1),
  [POT.x, POT.y, POT_H + 70],
];
const P = k.fitProjection(corners, WIDTH, HEIGHT, { pad: 14, azimuth: 52 });

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const byDepth = (points) => [...points].sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
const planeOf = (y) => k.sideMatrix([0, y], 0, P, "left");
const flat = (x0, z0, x1, z1, r, steps = 6) => k.pathOf(k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, steps).map(([u, z]) => [u, -z]), true);

// A plan turned about its centre by `angle` degrees, as a ring for k.extrude.
function turned({ x, y, w, d, r }, angle, steps = 4) {
  const cx = x + w / 2;
  const cy = y + d / 2;
  const a = (angle * Math.PI) / 180;
  const [c, s] = [Math.cos(a), Math.sin(a)];
  return k.roundedPlan({ x, y, w, d, r }, steps).map(([px, py]) => [cx + (px - cx) * c - (py - cy) * s, cy + (px - cx) * s + (py - cy) * c]);
}
// A plan's ring turned about another centre (a tab about its folder, a clip about its board).
const ringAbout = (plan, spin, steps = 3) => k.roundedPlan(plan, steps).map((p) => turnPoint(p, spin));
const turnPoint = ([px, py], { cx, cy, angle }) => {
  const a = (angle * Math.PI) / 180;
  return [cx + (px - cx) * Math.cos(a) - (py - cy) * Math.sin(a), cy + (px - cx) * Math.sin(a) + (py - cy) * Math.cos(a)];
};

// A closed Catmull-Rom curve through points, `per` samples per span.
function catmull(points, per = 6) {
  const n = points.length;
  const out = [];
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [points[(i - 1 + n) % n], points[i], points[(i + 1) % n], points[(i + 2) % n]];
    for (let j = 0; j < per; j++) {
      const t = j / per;
      const t2 = t * t;
      const t3 = t2 * t;
      out.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  return out;
}

// Drawn items, painted by depth. Each object is one group with data-object, so step 2 can wire hover and click.
const items = [];
const put = (key, svg) => items.push({ key, svg });
const object = (name, label, parts, extra = "") => `<g class="desk-object" data-object="${name}"${extra} tabindex="0" role="button" aria-label="${label}">${parts.join("")}</g>`;

let clips = 0;
function recess({ x0, x1, z0, z1, r, depth: dz }, y, back = "", backClass = "desk-well") {
  const id = `desk-clip-${clips++}`;
  const ring = k.roundedPlan({ x: x0, y: z0, w: x1 - x0, d: z1 - z0, r }, 4);
  const cx = (x0 + x1) / 2;
  const cz = (z0 + z1) / 2;
  const { sinA } = k.cameraOf(P);
  const tops = [];
  const sides = [[], [], [], []];
  ring.forEach(([ax, az], index) => {
    const [bx, bz] = ring[(index + 1) % ring.length];
    const length = Math.hypot(bx - ax, bz - az) || 1;
    let [nx, nz] = [(bz - az) / length, -(bx - ax) / length];
    if (nx * (cx - (ax + bx) / 2) + nz * (cz - (az + bz) / 2) < 0) [nx, nz] = [-nx, -nz];
    if (nx <= 0 && nz <= 0) return;
    const quad = k.pathOf([at([ax, y, az]), at([bx, y, bz]), at([bx, y - dz, bz]), at([ax, y - dz, az])], true);
    if (nz >= nx) tops.push(quad);
    else sides[Math.min(3, Math.max(0, Math.floor(((nx * -sinA + 1) / 2) * 4)))].push(quad);
  });
  const shape = flat(x0, z0, x1, z1, r);
  return [
    `<clipPath id="${id}"><path transform="${planeOf(y)}" d="${shape}"/></clipPath>`,
    `<g clip-path="url(#${id})">`,
    `<path class="iso-top" d="${tops.join("")}"/>`,
    ...sides.map((d, shade) => (d.length ? `<path class="iso-shade" data-shade="${shade}" d="${d.join("")}"/>` : "")),
    `<g transform="${planeOf(y - dz)}"><path class="${backClass}" d="${shape}"/>${back}</g>`,
    `</g>`,
    `<g transform="${planeOf(y)}"><path class="iso-line" data-tone="lo" d="${shape}"/></g>`,
  ].join("");
}

// ── Desk ────────────────────────────────────────────────────────────────
function desk() {
  const out = [];
  const LEG = 7;
  const legs = k.corners(DESK, 16);
  out.push(`<path class="iso-halo" d="${k.haloOf(k.insetPlan(DESK, 10), -TOP_H - LEG_H, 2, P)}"/>`);
  const apron = k.insetPlan(DESK, 12);
  // Parts are tagged (data-part) so the exploded view can pull them apart; they draw the same.
  out.push(`<g data-part="legs">`);
  for (const [x, y] of byDepth(legs)) {
    out.push(S(k.cylinder(x, y, LEG + 2, -TOP_H - LEG_H, 2.4, P, 24), { tone: "lo" }));
    out.push(S(k.slabOf({ x: x - LEG, y: y - LEG, w: LEG * 2, d: LEG * 2, r: 1.4 }, -TOP_H - LEG_H + 2.4, LEG_H - 2.4, P, 3, 0.4), { tone: "mid" }));
  }
  out.push(`</g><g data-part="apron">`);
  out.push(S(k.slabOf(apron, -TOP_H - 22, 22, P, 3), { tone: "mid", inner: L(k.sideSeam(apron, -TOP_H - 11, P, 3), { tone: "faint" }) }));
  out.push(`</g><g data-part="top">`);
  out.push(S(k.slabOf(DESK, -TOP_H, TOP_H, P, 6, 1.4), { tone: "mid", inner: L(k.sideSeam(DESK, -TOP_H + 2.4, P, 6), { tone: "faint" }) }));
  // Bracket screws where the legs meet the apron's visible faces.
  out.push(`</g><g data-part="screws">`);
  const front = apron.y + apron.d;
  const right = apron.x + apron.w;
  out.push(D([[apron.x + 14, front], [right - 14, front]].flatMap(([x, y]) => [at([x, y, -TOP_H - 6]), at([x, y, -TOP_H - 16])]), { size: 0.5 }));
  out.push(D([[right, apron.y + 14], [right, apron.y + apron.d - 14]].flatMap(([x, y]) => [at([x, y, -TOP_H - 6]), at([x, y, -TOP_H - 16])]), { size: 0.5 }));
  out.push(`</g><g data-part="grommet">`);
  // Cable grommet at the back, behind the monitor.
  out.push(S(k.cylinder(-70, -112, 6, -0.2, 0.4, P, 28), { tone: "lo", crease: "none" }));
  out.push(`<path class="desk-hole" d="${k.ring(-70, -112, 3.6, 0.2, P, 28)}"/>`);
  out.push(`</g>`);
  return out.join("");
}

// ── Desk mat ────────────────────────────────────────────────────────────
function mat() {
  return `<g data-part="mat">${S(k.slabOf(MAT, 0, 1, P, 6), { tone: "lo", crease: "none", inner: L(k.planOutline(k.insetPlan(MAT, 3), 1, P, 6), { tone: "faint" }) })}</g>`;
}

// ── Monitor ─────────────────────────────────────────────────────────────
const LOG = [
  ["RUN #41  tax_form.pdf", "lo"],
  ["  read_document()", "lo"],
  ["  ✗ tax ID blank  (died)", "lo"],
  ["  search_other_docs()", "lo"],
  ["  ✓ found · format valid", "lo"],
  ["ESCAPED → Tax · 2 attempts", "hi"],
  ["", "lo"],
  ["RUN #42  IMG_2041.jpg", "lo"],
  ["  enhance_image()", "lo"],
  ["  ? asking a human_", "hi"],
];
function monitor() {
  const out = [`<path class="iso-halo" d="${k.haloOf(STAND, 0, 6, P)}"/>`, `<g data-part="stand">`];
  out.push(S(k.slabOf(STAND, 0, 3.2, P, 8, 0.8), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(STAND, 4), 3.2, P, 8), { tone: "faint" }));
  out.push(S(k.slabOf(NECK, 3.2, MON_Z0 + 22, P, 3, 0.4), { tone: "mid" }));
  out.push(L(k.sideSeam(NECK, 18, P, 3), { tone: "faint" }));
  // The panel, its screen and the sticky note.
  const panel = k.slabOf(MON, MON_Z0, MON_Z1 - MON_Z0, P, 4, 0.6);
  const textX = SCREEN.x0 + 7;
  const lines = LOG.map(([text, tone], i) => `<text class="desk-log" data-tone="${tone}" x="${textX}" y="${-(SCREEN.z1 - 12 - i * 9.6)}" font-size="6.4">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`).join("");
  const scan = Array.from({ length: Math.floor((SCREEN.z1 - SCREEN.z0) / 2) }, (_, i) => `M${SCREEN.x0} ${-(SCREEN.z0 + 1 + i * 2)}H${SCREEN.x1}`).join("");
  const back = `<path class="desk-scan" d="${scan}"/>${lines}`;
  out.push(`</g><g data-part="panel">`);
  out.push(S(panel, { tone: "mid" }));
  out.push(recess(SCREEN, MON_FRONT, back, "desk-glass"));
  // Bottom chin: a power LED and the maker's slot, kept blank.
  out.push(D([at([MON.x + MON.w - 12, MON_FRONT, MON_Z0 + 4.5])], { size: 0.7, tone: "hi" }));
  out.push(`</g>`);
  return out.join("");
}
function stickyNote() {
  // A square note stuck to the bezel's lower right, slightly askew, its top edge curling off the glass.
  const y = MON_FRONT + 0.3;
  const x0 = MON.x + MON.w - 44;
  const z0 = MON_Z0 + 12;
  const size = 34;
  const tilt = (-4 * Math.PI) / 180;
  const corner = ([u, v]) => [x0 + u * Math.cos(tilt) - v * Math.sin(tilt), z0 + u * Math.sin(tilt) + v * Math.cos(tilt)];
  const quad = [[0, 0], [size, 0], [size, size], [0, size]].map(corner);
  const d = k.pathOf(quad.map(([u, z]) => [u, -z]), true);
  const rule = (v, w) => {
    const [a, b] = [corner([5, v]), corner([5 + w, v])];
    return `M${a[0].toFixed(1)} ${(-a[1]).toFixed(1)}L${b[0].toFixed(1)} ${(-b[1]).toFixed(1)}`;
  };
  const writing = [rule(23, 20), rule(16, 24), rule(9, 14)].join("");
  return `<g transform="${planeOf(y)}"><path class="desk-note" d="${d}"/><path class="desk-note-glue" d="${k.pathOf([corner([0, size - 6]), corner([size, size - 6])].map(([u, z]) => [u, -z]))}"/><path class="iso-line desk-ink" data-free="" d="${writing}"/><path class="iso-line" data-tone="mid" d="${d}"/></g>`;
}

// ── Photo frame (the Chicago lakefront photo) ───────────────────────────
function photoFrame() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: FRAME.x, y: FRAME.y - 18, w: FRAME.w, d: 24, r: 2 }, 0, 4, P)}"/>`];
  // Kickstand behind, a strut from the frame's back down to the desk.
  const strut = { x: FRAME.x + FRAME.w / 2 - 6, y: FRAME.y - 20, w: 12, d: 3, r: 0.8 };
  out.push(S(k.slabOf(strut, 0, 3, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf({ x: strut.x + 3, y: strut.y + 1, w: 6, d: 19, r: 0.6 }, 2.2, 2, P, 2), { tone: "lo" }));
  out.push(S(k.slabOf(FRAME, 0, FRAME_Z1, P, 3, 0.5), { tone: "mid" }));
  const img = `<image class="desk-photo" href="/me.jpg" x="${PHOTO.x0 - 2}" y="${-PHOTO.z1 - 2}" width="${PHOTO.x1 - PHOTO.x0 + 4}" height="${PHOTO.z1 - PHOTO.z0 + 4}" preserveAspectRatio="xMidYMid slice"/>`;
  out.push(recess(PHOTO, FRAME_FRONT, img, "desk-well"));
  return out.join("");
}

// ── Plant: a snake plant in a ribbed pot on a saucer ────────────────────
function plant() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: POT.x - 28, y: POT.y - 28, w: 56, d: 56, r: 28 }, 0, 4, P)}"/>`];
  out.push(S(k.cylinder(POT.x, POT.y, POT.r + 4, 0, 3, P, 48, 0.5), { tone: "lo" }));
  out.push(S(k.cylinder(POT.x, POT.y, POT.r - 3, 3, POT_H - 8, P, 48), { tone: "mid" }));
  out.push(S(k.cylinder(POT.x, POT.y, POT.r, POT_H - 8, 8, P, 48, 0.6), { tone: "mid", inner: L(k.sideArc(POT.x, POT.y, POT.r, POT_H - 4, P, 32), { tone: "faint" }) }));
  out.push(`<path class="desk-soil" d="${k.ring(POT.x, POT.y, POT.r - 2.4, POT_H, P, 40)}"/>`);
  out.push(L(k.ring(POT.x, POT.y, POT.r - 2.4, POT_H, P, 40), { tone: "lo" }));
  // Leaves: tall pointed blades standing in vertical planes, drawn back to front.
  const LEAVES = [
    { a: 20, h: 92, w: 20, lean: -6, off: [-8, -8] },
    { a: 80, h: 116, w: 22, lean: 4, off: [2, -10] },
    { a: 140, h: 80, w: 18, lean: 12, off: [10, -2] },
    { a: -30, h: 100, w: 21, lean: -10, off: [-12, 2] },
    { a: 110, h: 66, w: 17, lean: -14, off: [-4, 9] },
    { a: 45, h: 88, w: 20, lean: 14, off: [9, 8] },
    { a: -70, h: 74, w: 18, lean: 8, off: [2, 3] },
  ];
  const leaves = LEAVES.map((leaf) => ({ leaf, key: depth(POT.x + leaf.off[0], POT.y + leaf.off[1], 40) })).sort((a, b) => a.key - b.key);
  for (const { leaf } of leaves) out.push(blade(leaf));
  return out.join("");
}
function blade({ a, h, w, lean, off }) {
  const t = (a * Math.PI) / 180;
  const [ux, uy] = [Math.cos(t), Math.sin(t)];
  const base = [POT.x + off[0], POT.y + off[1], POT_H - 1];
  const point = (u, z) => at([base[0] + ux * (u + (lean * z) / h), base[1] + uy * (u + (lean * z) / h), base[2] + z]);
  const side = (sign) => Array.from({ length: 13 }, (_, i) => {
    const s = i / 12;
    const half = (w / 2) * Math.sin(Math.PI * Math.min(1, s * 1.15)) * (1 - s * 0.35);
    return point(sign * half, s * h);
  });
  const left = side(-1);
  const right = side(1).reverse();
  const outline = k.pathOf([...left, ...right], true);
  // Shade from how the blade faces the light; both faces are the same leaf colour.
  const { sinA, cosA } = k.cameraOf(P);
  const facing = Math.abs(-uy * -sinA + ux * cosA);
  const shade = Math.min(3, 1 + Math.floor(facing * 3));
  const vein = k.pathOf(Array.from({ length: 11 }, (_, i) => point(0, (i / 10) * h * 0.97)));
  const bands = [0.3, 0.5, 0.7].map((s) => k.pathOf([point(-(w / 2) * Math.sin(Math.PI * Math.min(1, s * 1.15)) * (1 - s * 0.35), s * h), point((w / 2) * Math.sin(Math.PI * Math.min(1, s * 1.15)) * (1 - s * 0.35), s * h)])).join("");
  return `<g class="desk-leaf"><path class="desk-leaf-fill" data-shade="${shade}" d="${outline}"/><path class="iso-line" data-tone="faint" d="${bands}"/><path class="iso-line" data-tone="lo" d="${vein}"/><path class="iso-line iso-edge" data-tone="mid" d="${outline}"/></g>`;
}

// ── Keyboard (mechanical, 65%) with a coiled cable ───────────────────────
function keyboard() {
  const out = [`<path class="iso-halo" d="${k.haloOf(KB, 1, 4, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(KB, 9))) out.push(S(k.cylinder(x, y, 3, 1, KB_Z, P, 16), { tone: "lo" }));
  out.push(S(k.slabOf(KB, 1 + KB_Z, KB_TOP - KB_Z - 1, P, 6, 1), { tone: "mid", inner: L(k.sideSeam(KB, 5.4, P, 6), { tone: "faint" }) }));
  const well = { x: KEYS_X - 1.6, y: KEYS_Y - 1.6, w: U * 15 + 3.2, d: U * 5 + 3.2, r: 2 };
  out.push(S(k.slabOf(well, KB_TOP - 0.4, 0.4, P, 3), { tone: "lo", crease: "none" }));
  out.push(D(k.corners(KB, 3.6).filter(([, y]) => y < KB.y + 10).map(([x, y]) => at([x, y, KB_TOP])), { size: 0.45 }));
  ROWS.forEach((row, r) => {
    let x = KEYS_X;
    for (const width of row) {
      const plan = { x: x + 0.8, y: KEYS_Y + r * U + 0.8, w: width * U - 1.6, d: U - 1.6, r: 1.6 };
      const h = ROW_H[r];
      out.push(S(k.slabOf(plan, KB_TOP, h, P, 3, 0.4), { tone: "mid", crease: "faint" }));
      out.push(L(k.planOutline(k.insetPlan(plan, 1.7), KB_TOP + h, P, 3), { tone: "faint" }));
      x += width * U;
    }
  });
  // Homing bumps on F and J.
  const homeZ = KB_TOP + ROW_H[2];
  out.push(L([4.25, 7.25].map((col) => k.lineOnTop([KEYS_X + col * U + 2.6, KEYS_Y + 2 * U + U * 0.66], [KEYS_X + col * U + 5.6, KEYS_Y + 2 * U + U * 0.66], homeZ, P)).join(""), { tone: "mid" }));
  return out.join("");
}
function cable() {
  // USB-C from the keyboard's back edge, a coiled run, then up into the monitor's stand.
  const out = [];
  const port = [KB.x + KB.w - 26, KB.y, 6];
  const coilFrom = KB.y - 30;
  const coilTo = KB.y - 6;
  const cx = KB.x + KB.w - 26;
  out.push(S(k.slabOf({ x: port[0] - 4, y: KB.y - 6, w: 8, d: 6, r: 1.2 }, 4, 4, P, 2), { tone: "mid" }));
  const spring = k.coil(coilFrom, coilTo, [cx, 5.4], 3.2, 9, "y", P);
  out.push(L(spring.back, { tone: "lo" }), L(spring.front, { tone: "mid" }));
  // Ferrules where the coil meets the plug and the straight run, so both coil ends land on something.
  out.push(S(k.slabOf({ x: cx - 2.4, y: coilTo - 1, w: 4.8, d: 2, r: 0.8 }, 3.2, 4.4, P, 2), { tone: "mid" }));
  out.push(S(k.slabOf({ x: cx - 2.4, y: coilFrom - 1, w: 4.8, d: 2, r: 0.8 }, 3.2, 4.4, P, 2), { tone: "mid" }));
  const run = k.pathOf([[cx, coilFrom, 5.4], [cx - 2, coilFrom - 6, 4], [cx - 16, coilFrom - 14, 1.4], [STAND.x + STAND.w - 2, STAND.y + STAND.d - 12, 1.6]].map(at));
  out.push(`<path class="iso-line desk-cord" data-tone="mid" d="${run}"/>`);
  out.push(D([at([STAND.x + STAND.w - 2, STAND.y + STAND.d - 12, 1.6])], { size: 0.9, tone: "mid" }));
  return `<g data-part="cable">${out.join("")}</g>`;
}

// ── Controller (black) ──────────────────────────────────────────────────
function controller() {
  const out = [];
  const cx = PAD.x;
  const cy = PAD.y + 18;
  const spin = { cx, cy, angle: PAD.angle };
  // Body: a smooth closed curve through hand-placed points (back edge, two grips), turned with the pad.
  const SHAPE = [
    [-40, -14], [-20, -17], [0, -15.5], [20, -17], [40, -14], [48, -5], [50, 7], [48, 20], [43, 31], [35, 36], [27, 31], [21, 19],
    [11, 13], [0, 12], [-11, 13], [-21, 19], [-27, 31], [-35, 36], [-43, 31], [-48, 20], [-50, 7], [-48, -5],
  ];
  const ring = catmull(SHAPE, 6).map(([x, y]) => turnPoint([cx + x, cy + y], spin));
  // Bumpers first: they sit behind the body's back edge, half hidden by it.
  for (const sign of [-1, 1]) out.push(S(k.extrude(ringAbout({ x: cx + sign * 29 - 11, y: cy - 19, w: 22, d: 7, r: 3 }, spin), 3, 6, P, { bevel: 0.3 }), { tone: "lo", className: "desk-black" }));
  out.push(`<path class="iso-halo" d="${k.extrude(ring, 0, 4, P).fill}"/>`);
  const body = k.extrude(ring, 0, 10, P, { convex: false, bevel: 0.8 });
  out.push(S(body, { tone: "mid", className: "desk-black" }));
  const top = 10;
  const pt = (x, y) => turnPoint([cx + x, cy + y], spin);
  // Sticks.
  for (const [x, y] of [[-27, -3], [13, 9]]) {
    const [sx, sy] = pt(x, y);
    out.push(S(k.cylinder(sx, sy, 5.4, top, 1, P, 28), { tone: "lo", className: "desk-black" }));
    out.push(S(k.cylinder(sx, sy, 3.2, top + 1, 3, P, 24), { tone: "mid", className: "desk-black" }));
    out.push(S(k.cylinder(sx, sy, 4.4, top + 4, 1.6, P, 28, 0.4), { tone: "mid", className: "desk-black" }));
    out.push(L(k.ring(sx, sy, 2.6, top + 5.6, P, 24), { tone: "lo" }));
  }
  // D-pad: two crossed bars.
  const [dx, dy] = pt(-13, 9);
  const dpad = { cx: dx, cy: dy, angle: PAD.angle };
  out.push(S(k.extrude(ringAbout({ x: dx - 6, y: dy - 2, w: 12, d: 4, r: 0.8 }, dpad, 2), top, 1.6, P), { tone: "mid", className: "desk-black" }));
  out.push(S(k.extrude(ringAbout({ x: dx - 2, y: dy - 6, w: 4, d: 12, r: 0.8 }, dpad, 2), top, 1.6, P), { tone: "mid", className: "desk-black" }));
  // Face buttons.
  for (const [x, y] of [[29, -9], [35, -3], [29, 3], [23, -3]]) {
    const [bx, by] = pt(x, y);
    out.push(S(k.cylinder(bx, by, 2.3, top, 1.6, P, 20, 0.3), { tone: "mid", className: "desk-black" }));
  }
  // Centre: two small buttons and the home button.
  for (const [x, y, r] of [[-6, -8, 1.3], [6, -8, 1.3], [0, 0, 2.6]]) {
    const [bx, by] = pt(x, y);
    out.push(S(k.cylinder(bx, by, r, top, 0.8, P, 18), { tone: "mid", className: "desk-black" }));
  }
  return out.join("");
}

// ── Clipboard with the résumé ───────────────────────────────────────────
function clipboard() {
  const out = [];
  const { x, y, w, d, angle } = CLIP;
  const board = { x, y, w, d, r: 3 };
  out.push(`<path class="iso-halo" d="${k.extrude(turned(board, angle), 0, 2, P).fill}"/>`);
  out.push(S(k.extrude(turned(board, angle), 0, 2, P, { bevel: 0.5 }), { tone: "mid" }));
  const spin = { cx: x + w / 2, cy: y + d / 2, angle };
  const sheet = { x: x + 4, y: y + 12, w: w - 8, d: d - 16, r: 0.4 };
  out.push(S(k.extrude(ringAbout(sheet, spin, 2), 2, 0.4, P), { tone: "hi", crease: "none" }));
  const lineAt = (u0, u1, v) => k.onTop([turnPoint([sheet.x + u0, sheet.y + v], spin), turnPoint([sheet.x + u1, sheet.y + v], spin)], 2.4, P);
  const rules = [lineAt(5, 30, 7), lineAt(5, 22, 11)];
  for (let v = 19; v < sheet.d - 6; v += 4.4) rules.push(lineAt(5, (v * 7) % 11 < 4 ? 28 : 38, v));
  out.push(L(rules.join(""), { tone: "lo", free: true }));
  // The clip: a plate riveted to the board, a rolled hinge and a lever.
  const plate = { x: x + w / 2 - 14, y: y + 2, w: 28, d: 12, r: 2 };
  out.push(S(k.extrude(ringAbout(plate, spin), 2, 1, P, { bevel: 0.3 }), { tone: "mid" }));
  out.push(S(k.extrude(ringAbout({ x: plate.x + 2, y: plate.y + 8.4, w: plate.w - 4, d: 3, r: 1.4 }, spin), 3, 1.8, P, { bevel: 0.3 }), { tone: "mid" }));
  const lever = { x: plate.x + 6, y: plate.y + 3, w: plate.w - 12, d: 6, r: 2 };
  out.push(S(k.extrude(ringAbout(lever, spin), 3, 3.4, P, { bevel: 0.3 }), { tone: "mid" }));
  out.push(D([turnPoint([plate.x + 3, plate.y + 2.6], spin), turnPoint([plate.x + plate.w - 3, plate.y + 2.6], spin)].map(([px, py]) => at([px, py, 3])), { size: 0.5 }));
  return out.join("");
}

// ── Project folders, fanned ─────────────────────────────────────────────
// Folder i of n, counted from the bottom of the stack.
function folder(i, n) {
  const out = [];
  // Fanned toward the viewer so every folder keeps a strip you can click: the top one is nearest.
  const angle = [-9, -4, 1, 6, 10][i];
  const plan = { x: FOLDERS.x + i * 5, y: FOLDERS.y - (n - 1 - i) * 12, w: FOLDERS.w, d: FOLDERS.d, r: 1.6 };
  const z = i * 2.2;
  if (i === 0) out.push(`<path class="iso-halo" d="${k.extrude(turned(plan, angle), 0, 2, P).fill}"/>`);
  // Back cover with a tab (staggered so every tab shows), then the front cover a little shorter.
  const spin = { cx: plan.x + plan.w / 2, cy: plan.y + plan.d / 2, angle };
  const step = n > 1 ? (plan.w - 26 - 16) / (n - 1) : 0;
  const tab = { x: plan.x + 8 + (n - 1 - i) * step, y: plan.y - 7, w: 26, d: 9, r: 2 };
  out.push(S(k.extrude(ringAbout(tab, spin), z, 0.8, P), { tone: "mid" }));
  out.push(S(k.extrude(ringAbout(plan, spin, 4), z, 0.8, P), { tone: "mid" }));
  out.push(S(k.extrude(ringAbout({ ...plan, y: plan.y + 4, d: plan.d - 4 }, spin, 4), z + 0.8, 1.2, P, { bevel: 0.4 }), { tone: "mid" }));
  const label = [turnPoint([tab.x + 5, tab.y + 3.4], spin), turnPoint([tab.x + 19, tab.y + 3.4], spin)];
  out.push(L(k.onTop(label, z + 0.8, P), { tone: "mid", free: true }));
  return out.join("");
}

// ── A stack of boarding passes ──────────────────────────────────────────
function tickets() {
  const out = [];
  const passes = [-18, -8, 4, 12];
  passes.forEach((angle, i) => {
    const plan = { x: TICKETS.x, y: TICKETS.y, w: 62, d: 24, r: 1.2 };
    const z = i * 0.7;
    if (i === 0) out.push(`<path class="iso-halo" d="${k.extrude(turned(plan, angle), 0, 1, P).fill}"/>`);
    out.push(S(k.extrude(turned(plan, angle, 2), z, 0.6, P), { tone: "hi", crease: "none" }));
    const spin = { cx: plan.x + plan.w / 2, cy: plan.y + plan.d / 2, angle };
    if (i === passes.length - 1) {
      const perforation = Array.from({ length: 9 }, (_, j) => turnPoint([plan.x + 44, plan.y + 2 + j * 2.5], spin)).map(([px, py]) => at([px, py, z + 0.6]));
      out.push(D(perforation, { size: 0.35, tone: "mid" }));
      const rule = (u0, u1, v) => k.onTop([turnPoint([plan.x + u0, plan.y + v], spin), turnPoint([plan.x + u1, plan.y + v], spin)], z + 0.6, P);
      out.push(L([rule(4, 20, 6), rule(26, 40, 6), rule(4, 14, 12), rule(4, 34, 18), rule(48, 58, 8), rule(48, 55, 14)].join(""), { tone: "lo", free: true }));
      // A tiny plane mark between the two airport codes.
      out.push(D([turnPoint([plan.x + 23, plan.y + 6], spin)].map(([px, py]) => at([px, py, z + 0.6])), { size: 0.6, tone: "hi" }));
    }
  });
  return out.join("");
}

// Paint order: the desk, then objects back to front by the depth of a point near each footprint.
put(-1e9, desk());
put(depth(0, MAT.y + 10) - 1e6, mat());
put(depth(POT.x, POT.y), object("plant", "A snake plant", [plant()]));
put(depth(0, STAND.y), object("monitor", "The computer: open rohanOS", [monitor()]));
put(depth(0, STAND.y) + 0.01, object("sticky", "Sticky note: say hi", [stickyNote()]));
put(depth(FRAME.x + 30, FRAME.y), object("photo", "A photo of Rohan in Chicago", [photoFrame()]));
put(depth(TICKETS.x, TICKETS.y), object("tickets", "How I got here", [tickets()]));
// Bottom of the stack is the last project; each folder is its own clickable object.
[...PROJECTS].reverse().forEach((project, i) => {
  put(depth(FOLDERS.x + 50, FOLDERS.y) + i * 0.01, object("folder", `Project folder: ${project.name}`, [folder(i, PROJECTS.length)], ` data-slug="${project.slug}"`));
});
put(depth(0, KB.y - 20) - 0.5, cable());
put(depth(0, KB.y), object("keyboard", "Skills", [keyboard()]));
put(depth(PAD.x, PAD.y + 10), object("controller", "Currently playing", [controller()]));
put(depth(CLIP.x + 20, CLIP.y + 30), object("clipboard", "Résumé", [clipboard()]));
items.sort((a, b) => a.key - b.key);

const LABEL = "Rohan's desk, drawn in isometric: a monitor running a document-checking agent with a sticky note on it, a framed photo of Rohan by Lake Michigan in Chicago, a snake plant, three project folders, a stack of boarding passes, a mechanical keyboard, a black game controller and a clipboard with his résumé.";
const svg = k.figureSvg({ width: WIDTH, height: HEIGHT, label: LABEL, className: "desk-svg", body: items.map((item) => item.svg) });

const CSS = `
.desk-well{fill:var(--anatomy-shade-1)}
.desk-glass{fill:var(--anatomy-shade-0)}
.desk-scan{fill:none;stroke:var(--anatomy-faint);stroke-width:.4px;vector-effect:non-scaling-stroke;opacity:.5}
.desk-log{font-family:var(--anatomy-mono);fill:var(--anatomy-mid);letter-spacing:.02em}
.desk-log[data-tone="hi"]{fill:var(--anatomy-lit)}
.desk-hole{fill:var(--anatomy-shade-0);stroke:var(--anatomy-lo);stroke-width:var(--anatomy-weight)}
.desk-soil{fill:var(--anatomy-shade-0)}
.desk-note{fill:var(--anatomy-lit-top)}
.desk-note-glue{fill:none;stroke:var(--anatomy-faint);stroke-width:.5px;vector-effect:non-scaling-stroke}
.desk-ink{stroke:var(--anatomy-mid)}
.desk-photo{filter:grayscale(1) contrast(1.05)}
.desk-leaf-fill{stroke:none}
.desk-leaf-fill[data-shade="0"]{fill:var(--anatomy-shade-0)}
.desk-leaf-fill[data-shade="1"]{fill:var(--anatomy-shade-3)}
.desk-leaf-fill[data-shade="2"]{fill:var(--anatomy-top)}
.desk-leaf-fill[data-shade="3"]{fill:var(--anatomy-lit-top)}
.desk-cord{stroke-width:1.1px}
.desk-black>.iso-fill{fill:#0c0c0d}
.desk-black>.iso-top{fill:#19191b}
.desk-black>.iso-shade{fill:#0a0a0b}
.iso[data-theme="light"] .desk-black>.iso-fill{fill:#2a2a2d}
.iso[data-theme="light"] .desk-black>.iso-top{fill:#3a3a3e}
.iso[data-theme="light"] .desk-black>.iso-shade{fill:#232326}
.iso[data-theme="light"] .desk-black>.iso-edge{stroke:#111}
`;

// ── Exploded view (lab) ─────────────────────────────────────────────────
// Screen vectors for one world unit along each axis, and where each part sits on the desk,
// so the page can lift parts along z and peel the screen's layers toward the viewer.
const vec = (dx, dy, dz) => {
  const [ax, ay] = at([0, 0, 0]);
  const [bx, by] = at([dx, dy, dz]);
  return [+(bx - ax).toFixed(4), +(by - ay).toFixed(4)];
};
const spot = (x, y, z = 0) => at([x, y, z]).map((n) => +n.toFixed(1));
const GEOM = {
  origin: spot(0, 0),
  floor: -TOP_H - LEG_H,
  up: vec(0, 0, 1),
  toward: vec(0, 1, 0),
  right: vec(1, 0, 0),
  anchors: {
    plant: spot(POT.x, POT.y),
    monitor: spot(0, STAND.y + STAND.d / 2),
    sticky: spot(MON.x + MON.w - 27, MON_FRONT, MON_Z0 + 29),
    photo: spot(FRAME.x + FRAME.w / 2, FRAME.y),
    tickets: spot(TICKETS.x + 31, TICKETS.y + 12),
    folders: spot(FOLDERS.x + FOLDERS.w / 2, FOLDERS.y + FOLDERS.d / 2),
    keyboard: spot(KB.x + KB.w / 2, KB.y + KB.d / 2),
    controller: spot(PAD.x, PAD.y),
    clipboard: spot(CLIP.x + CLIP.w / 2, CLIP.y + CLIP.d / 2),
    screen: spot((SCREEN.x0 + SCREEN.x1) / 2, MON_FRONT, (SCREEN.z0 + SCREEN.z1) / 2),
  },
};

// The screen's layers: the onboarding agent from the glass back to the model. Each pane is
// drawn in the screen's plane; the page slides them toward the viewer.
const PANES = [
  { n: "04", title: "MODEL", lines: ["an LLM reads each document", "and proposes fields"], art: "model" },
  { n: "03", title: "GUARDRAILS", lines: ["output must match a schema;", "bad output retries, then falls back"], art: "guard" },
  { n: "02", title: "AGENT LOOP", lines: ["LangGraph: each step is a node", "that calls a tool"], art: "graph" },
  { n: "01", title: "INTERFACE", lines: ["seller uploads KYC, tax, legal", "activation: days → minutes"], art: "ui" },
];
function pane({ n, title, lines, art }, i) {
  const { x0, x1, z0, z1 } = SCREEN;
  const shape = flat(x0, z0, x1, z1, 1.6);
  const tx = x0 + 8;
  const text = (t, x, z, size, cls = "xp-pane-text") => `<text class="${cls}" x="${x}" y="${-z}" font-size="${size}">${t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`;
  const parts = [`<path class="xp-pane" d="${shape}"/>`];
  parts.push(text(`${n}`, tx, z1 - 14, 6, "xp-pane-num"), text(title, tx + 14, z1 - 14, 7.2, "xp-pane-title"));
  lines.forEach((line, j) => parts.push(text(line, tx, z1 - 64 - j * 9, 5.6)));
  // A small diagram per layer, in the same hairline.
  const box = (x, z, w, h, label) => `<path class="xp-pane-box" d="${flat(x, z, x + w, z + h, 1)}"/>` + text(label, x + 3, z + h / 2 - 1.6, 4.6, "xp-pane-small");
  const arrow = (xa, xb, z) => `<path class="xp-pane-wire" d="M${xa} ${-z}H${xb - 2}M${xb - 4} ${-z - 1.6}L${xb - 1.4} ${-z}L${xb - 4} ${-z + 1.6}"/>`;
  const zb = z1 - 38;
  if (art === "graph") {
    parts.push(box(tx, zb, 34, 12, "read"), arrow(tx + 34, tx + 46, zb + 6), box(tx + 46, zb, 40, 12, "validate"), arrow(tx + 86, tx + 98, zb + 6), box(tx + 98, zb, 40, 12, "look up"));
    parts.push(`<path class="xp-pane-wire" data-dash="" d="M${tx + 66} ${-zb}C${tx + 66} ${-(zb - 12)} ${tx + 20} ${-(zb - 12)} ${tx + 17} ${-(zb - 1)}"/>`, text("retry", tx + 36, zb - 13, 4.4, "xp-pane-small"));
  } else if (art === "guard") {
    parts.push(box(tx, zb, 36, 12, "{ schema }"), arrow(tx + 36, tx + 50, zb + 6), text("✓ pass", tx + 52, zb + 7.6, 5, "xp-pane-small"), text("✗ retry → fallback", tx + 52, zb + 0.6, 5, "xp-pane-small"));
  } else if (art === "model") {
    parts.push(box(tx, zb, 30, 12, "LLM"), text("· eval set on every prompt change", tx + 34, zb + 4.4, 5, "xp-pane-small"));
  } else {
    parts.push(box(tx, zb, 52, 12, "documents"), arrow(tx + 52, tx + 66, zb + 6), box(tx + 66, zb, 34, 12, "live ✓"));
  }
  return `<g class="xp-pane-layer" data-pane="${i}"><g transform="${planeOf(MON_FRONT + 0.6)}">${parts.join("")}</g></g>`;
}
const PANES_SVG = PANES.map(pane).join("");

// The site imports the SVG and CSS from a generated module.
const out = join(ROOT, "src", "desk");
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "desk-art.ts"), `// Generated by figures/desk/build.mjs. Do not edit.\nexport const DESK_SVG = ${JSON.stringify(svg)};\nexport const DESK_CSS = ${JSON.stringify(CSS)};\nexport const DESK_GEOM = ${JSON.stringify(GEOM)};\nexport const DESK_PANES = ${JSON.stringify(PANES_SVG)};\n`);

const body = `<style>${CSS}</style>` + k.plateHtml({ fig: "Fig 1", title: "Rohan's desk", hint: "static · step 1", readout: "", body: svg });
const page = k.pageHtml({ title: "Rohan's desk", theme, body, width: 1100 }).replace('href="/me.jpg"', `href="file://${join(ROOT, "public", "me.jpg")}"`);
const name = theme === "light" ? "desk-light.html" : "desk.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name, "·", items.length, "items");
