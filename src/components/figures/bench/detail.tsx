import * as React from "react";
import type { Flat } from "@/components/iso/iso-kit";
import { Line, Plate, Solid } from "@/components/iso/react/draw";
import { CARTRIDGES } from "./model";
import { LAYERS } from "./art";
import { CROP_H, CROP_W, type DetailSpec } from "./details";
import { cardPathsOf, coilOf, drawerBodyOf, flapOf, latchOf, needleOf, poseOf, type Pose } from "./frame";
import { CABINET_ART, SOCKET_ART } from "./geometry";
import type { Group, PartId } from "./layers";
import { PLATE_EMPTY, at, shift } from "./view";
import "./bench.css";

// A detail figure (design pass, section 5): a static, server-rendered crop of
// the same bench art, frozen in one pose. Parts in the focus groups draw
// normally; neighbours inside the crop draw solid but faint (`data-ctx`), in
// the same painter's order, so they still hide what is behind them. Strokes
// keep their hairline weight (`vector-effect: non-scaling-stroke`), so the
// crop magnifies the geometry, not the lines. No client JS.

const JAW_TRAVEL = 1.6; // as in live.tsx

/* ---------- The frozen pose of each moving part ---------- */

function posed(id: PartId, art: Layer["art"], pose: Pose, spec: DetailSpec): React.ReactNode {
  const carts = (LAYERS.find((layer) => layer.id === "rackCarts")!.art ?? []) as React.ReactNode[];
  const list = (value: Layer["art"]) => (Array.isArray(value) ? value : [value]);
  const { picker } = pose;
  const cartsIn = (layer: "rack" | "socket") =>
    carts.map((cart, index) => {
      const place = pose.carts[index]!;
      if (place.layer !== layer) return null;
      const seated = spec.state.seated === index && layer === "socket";
      const held = !seated && layer === "socket";
      return (
        <g key={`${layer}-${index}`} className="bench-cart" data-seated={seated ? "" : undefined} data-held={held ? "" : undefined} transform={shift(place.x, 0, place.z)}>
          <title>{held ? `${CARTRIDGES[index]} (held by the picker)` : CARTRIDGES[index]}</title>
          {cart}
        </g>
      );
    });
  switch (id) {
    case "drawer": {
      const body = drawerBodyOf(pose.drawer);
      return body ? <Solid paths={body} tone="mid" crease="faint" /> : null;
    }
    case "vectorFront":
      return <g transform={shift(0, pose.drawer, 0)}>{art}</g>;
    case "rackCarts":
      return cartsIn("rack");
    case "socketCarts":
      return cartsIn("socket");
    case "coilBack":
      return <path className="iso-line bench-coil" data-tone="lo" d={coilOf(pose.plate).back} />;
    case "coilFront":
      return <path className="iso-line bench-coil" data-tone="mid" d={coilOf(pose.plate).front} />;
    case "seatPlate":
      return <g transform={shift(0, 0, pose.plate - PLATE_EMPTY)}>{art}</g>;
    case "jawBack":
      return <g transform={shift(picker.x - picker.open * JAW_TRAVEL, 0, picker.grip)}>{art}</g>;
    case "jawFront":
      return <g transform={shift(picker.x + picker.open * JAW_TRAVEL, 0, picker.grip)}>{art}</g>;
    case "carriage":
    case "housing":
      return <g transform={shift(picker.x)}>{art}</g>;
    case "plunger":
      return <g transform={shift(picker.x, 0, picker.grip)}>{art}</g>;
    case "windowDots":
      return pose.window === null ? null : list(art)[pose.window];
    case "latch":
      return <Solid paths={latchOf(pose.latch)} tone="mid" crease="faint" />;
    case "flap":
      return <Solid paths={flapOf(pose.flap)} tone="mid" crease="faint" />;
    case "stack":
      return list(art).slice(0, pose.stack);
    case "ghost":
      return pose.ghost > 0.01 ? <g style={{ opacity: Math.round(pose.ghost * 100) / 100 }}>{art}</g> : null;
    case "card": {
      if (!pose.card.shown || pose.card.alpha < 0.05) return null;
      const card = cardPathsOf(pose.card);
      return (
        <g className="bench-card">
          <Solid paths={card.body} tone="hi" crease="lo" lit />
          {card.ear ? <Solid paths={card.ear} tone="hi" crease="lo" lit /> : null}
          <Line d={card.rules} tone="lo" free />
        </g>
      );
    }
    case "needle":
      return <path className="iso-line bench-needle" data-tone="hi" d={needleOf(pose.count)} />;
    default:
      return art;
  }
}

type Layer = (typeof LAYERS)[number];

/* ---------- Culling: keep only what falls inside the crop ---------- */

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const NUMBER = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
const TRANSLATE = /translate\(\s*(-?[\d.]+)[ ,]+(-?[\d.]+)\s*\)/;

const grow = (box: Box | null, [x, y]: Flat): Box => (box ? { x0: Math.min(box.x0, x), y0: Math.min(box.y0, y), x1: Math.max(box.x1, x), y1: Math.max(box.y1, y) } : { x0: x, y0: y, x1: x, y1: y });

function pointsOfD(d: string): Flat[] {
  const values = (d.match(NUMBER) ?? []).map(Number);
  const out: Flat[] = [];
  for (let index = 0; index + 1 < values.length; index += 2) out.push([values[index]!, values[index + 1]!]);
  return out;
}

type Props = Record<string, unknown>;

/** Points an element draws, in its own coordinates (bench paths are absolute M/L/Z). */
function ownPoints(props: Props): Flat[] {
  const out: Flat[] = [];
  if (typeof props.d === "string") out.push(...pointsOfD(props.d));
  const paths = props.paths as { fill?: string; outline?: string } | undefined;
  if (paths?.fill) out.push(...pointsOfD(paths.fill));
  if (paths?.outline) out.push(...pointsOfD(paths.outline));
  if (Array.isArray(props.points)) out.push(...(props.points as Flat[]).map(([x, y]) => [x, y] as Flat));
  for (const key of ["from", "to"]) if (Array.isArray(props[key])) out.push(props[key] as Flat);
  if (Array.isArray(props.via)) out.push(...(props.via as Flat[]));
  return out;
}

const LEAVES = new Set<unknown>([Solid, Line]);

/**
 * Walk an element tree and drop every drawn element whose bounds miss `keep`.
 * Containers are kept when any child is. `edit` may swap an element (to add a
 * motion to it) before it is placed.
 */
function cull(node: React.ReactNode, keep: Box, dx: number, dy: number, edit: (element: React.ReactElement<Props>) => React.ReactElement<Props>): React.ReactNode {
  if (Array.isArray(node)) {
    const kept = node.map((child) => cull(child, keep, dx, dy, edit)).filter((child) => child !== null && child !== undefined && child !== false);
    return kept.length ? kept : null;
  }
  if (!React.isValidElement<Props>(node)) return node ?? null;
  const element = edit(node);
  const props = element.props;
  let tx = dx;
  let ty = dy;
  const move = typeof props.transform === "string" ? TRANSLATE.exec(props.transform) : null;
  if (move) {
    tx += Number(move[1]);
    ty += Number(move[2]);
  }
  const points = ownPoints(props);
  if (points.length || LEAVES.has(element.type)) {
    let box: Box | null = null;
    for (const [x, y] of points) box = grow(box, [x + tx, y + ty]);
    if (!box || box.x1 < keep.x0 || box.x0 > keep.x1 || box.y1 < keep.y0 || box.y0 > keep.y1) return null;
    return element;
  }
  if (props.children === undefined) return element; // <title> and the like
  const children = cull(props.children as React.ReactNode, keep, tx, ty, edit);
  if (children === null) return null;
  if (typeof element.type === "string" && element.type === "title") return element;
  return React.cloneElement(element, undefined, ...(Array.isArray(children) ? children : [children]));
}

/* ---------- The figure ---------- */

// Line ends at the crop edge fade over the outer 7% of the card instead of stopping.
const FADE = 0.07;

export function BenchDetail({ spec }: { spec: DetailSpec }) {
  const pose = poseOf(spec.state);
  const [cx, cy] = at(spec.centre);
  const view = { x: cx - CROP_W / 2, y: cy - CROP_H / 2, w: CROP_W, h: CROP_H };
  // Keep parts a little beyond the crop, so a line that crosses the edge still
  // ends on the part it belongs to.
  const margin = 40;
  const keep: Box = { x0: view.x - margin, y0: view.y - margin, x1: view.x + view.w + margin, y1: view.y + view.h + margin };
  const focus = new Set<Group>(spec.focus);
  const pulse = spec.motion === "pins";
  const edit = (element: React.ReactElement<Props>) => {
    const points = element.props.points;
    if (pulse && (points === CABINET_ART.connectorPins || points === SOCKET_ART.pins)) return React.cloneElement(element, { pulse: true });
    return element;
  };
  const drawn = LAYERS.map((layer) => {
    const lead = focus.has(layer.group) || Boolean(spec.parts?.includes(layer.id));
    if (!lead && !spec.context.includes(layer.group)) return null;
    const node = cull(posed(layer.id, layer.art, pose, spec), keep, 0, 0, edit);
    if (node === null) return null;
    return lead ? (
      <g key={layer.id} data-part={layer.id}>
        {node}
      </g>
    ) : (
      <g key={layer.id} data-part={layer.id} data-ctx="">
        {node}
      </g>
    );
  });
  const id = spec.id;
  const r = (value: number) => Math.round(value * 100) / 100;
  return (
    <Plate fig={spec.fig} title={spec.title} readout={spec.readout} caption={spec.caption}>
      <div className="iso-stage bench-detail" data-detail="" data-motion={spec.motion}>
        <svg className="iso-svg" viewBox={`${r(view.x)} ${r(view.y)} ${view.w} ${view.h}`} role="img" aria-label={spec.label} focusable="false">
          <defs aria-hidden="true">
            <linearGradient id={`${id}-fade-x`} gradientUnits="userSpaceOnUse" x1={r(view.x)} y1="0" x2={r(view.x + view.w)} y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset={FADE} stopColor="#fff" stopOpacity="1" />
              <stop offset={1 - FADE} stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`${id}-fade-y`} gradientUnits="userSpaceOnUse" x1="0" y1={r(view.y)} x2="0" y2={r(view.y + view.h)}>
              <stop offset="0" stopColor="#fff" stopOpacity="0" />
              <stop offset={FADE} stopColor="#fff" stopOpacity="1" />
              <stop offset={1 - FADE} stopColor="#fff" stopOpacity="1" />
              <stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <mask id={`${id}-mask-x`} maskUnits="userSpaceOnUse" x={r(view.x)} y={r(view.y)} width={view.w} height={view.h}>
              <rect x={r(view.x)} y={r(view.y)} width={view.w} height={view.h} fill={`url(#${id}-fade-x)`} />
            </mask>
            <mask id={`${id}-mask-y`} maskUnits="userSpaceOnUse" x={r(view.x)} y={r(view.y)} width={view.w} height={view.h}>
              <rect x={r(view.x)} y={r(view.y)} width={view.w} height={view.h} fill={`url(#${id}-fade-y)`} />
            </mask>
          </defs>
          <g mask={`url(#${id}-mask-x)`}>
            <g mask={`url(#${id}-mask-y)`}>{drawn}</g>
          </g>
        </svg>
      </div>
    </Plate>
  );
}
