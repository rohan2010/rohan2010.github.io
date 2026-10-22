"use client";

import * as React from "react";
import type { SolidPaths } from "@/components/iso/iso-kit";
import { IsoFigure } from "@/components/iso/react/draw";
import { asksForStillness, follow, spring, useReadout, type Spring } from "@/components/iso/react/live";
import { CARTRIDGES, REST, busy, readoutOf, settleNow, spokenOf, step, type BenchInput, type BenchState } from "./model";
import { cardPathsOf, coilOf, drawerBodyOf, flapOf, latchOf, needleOf, poseOf, type Pose } from "./frame";
import type { LiveLayer, PartId } from "./layers";
import { HEIGHT, PLATE_EMPTY, WIDTH, shift } from "./view";

const TOUR_FIRST = 1400;
const TOUR_BACK = 3600;
const TOUR_GAP = 0.5;
const MOST_DT = 1 / 30;

/* ---------- A solid whose paths are rewritten each frame ---------- */

interface SolidNodes {
  root: SVGGElement | null;
  fill: SVGPathElement | null;
  shades: (SVGPathElement | null)[];
  top: SVGPathElement | null;
  crease: SVGPathElement | null;
  edge: SVGPathElement | null;
}

const solidNodes = (): SolidNodes => ({ root: null, fill: null, shades: [null, null, null, null], top: null, crease: null, edge: null });

function applySolid(slotRef: React.RefObject<SolidNodes>, paths: SolidPaths | null) {
  const nodes = slotRef.current;
  if (!nodes.root) return;
  if (!paths) {
    nodes.root.setAttribute("display", "none");
    return;
  }
  nodes.root.removeAttribute("display");
  nodes.fill?.setAttribute("d", paths.fill);
  paths.shades.forEach((d, index) => nodes.shades[index]?.setAttribute("d", d));
  nodes.top?.setAttribute("d", paths.top);
  nodes.crease?.setAttribute("d", paths.crease);
  nodes.edge?.setAttribute("d", paths.outline);
}

function LiveSolid({ slotRef, paths, tone = "mid", crease = "faint", lit = false, className }: { slotRef: React.RefObject<SolidNodes>; paths: SolidPaths | null; tone?: string; crease?: string; lit?: boolean; className?: string }) {
  return (
    <g
      ref={(node) => {
        slotRef.current.root = node;
      }}
      className={className ? `iso-solid ${className}` : "iso-solid"}
      data-lit={lit ? "" : undefined}
      display={paths ? undefined : "none"}
    >
      <path ref={(node) => void (slotRef.current.fill = node)} className="iso-fill" d={paths?.fill ?? ""} />
      {[0, 1, 2, 3].map((index) => (
        <path
          key={index}
          ref={(node) => {
            slotRef.current.shades[index] = node;
          }}
          className="iso-shade"
          data-shade={index}
          d={paths?.shades[index] ?? ""}
        />
      ))}
      <path ref={(node) => void (slotRef.current.top = node)} className="iso-top" d={paths?.top ?? ""} />
      <path ref={(node) => void (slotRef.current.crease = node)} className="iso-line iso-crease" data-tone={crease} d={paths?.crease ?? ""} />
      <path ref={(node) => void (slotRef.current.edge = node)} className="iso-line iso-edge" data-tone={tone} d={paths?.outline ?? ""} />
    </g>
  );
}

/* ---------- The live figure ---------- */

interface Props {
  label: string;
  /** every part in painter's order (art.tsx, `LAYERS`) */
  layers: LiveLayer[];
}

interface Nodes {
  rack: (SVGGElement | null)[];
  socket: (SVGGElement | null)[];
  windows: (SVGGElement | null)[];
  stack: (SVGGElement | null)[];
  carriage: SVGGElement | null;
  plunger: SVGGElement | null;
  jawBack: SVGGElement | null;
  jawFront: SVGGElement | null;
  housing: SVGGElement | null;
  plate: SVGGElement | null;
  coilBack: SVGPathElement | null;
  coilFront: SVGPathElement | null;
  vectorFront: SVGGElement | null;
  card: SVGGElement | null;
  rules: SVGPathElement | null;
  ghost: SVGGElement | null;
  needle: SVGPathElement | null;
}

const restPose = poseOf(REST);
const JAW_TRAVEL = 1.6;

export function BenchLive(props: Props) {
  const { anchor: anchorRef, say } = useReadout<HTMLDivElement>();
  const root = React.useRef<HTMLDivElement | null>(null);
  const describedBy = React.useId();
  const status = React.useRef<HTMLSpanElement | null>(null);
  const announcer = React.useRef<HTMLSpanElement | null>(null);
  const nodes = React.useRef<Nodes>({
    rack: [null, null, null, null],
    socket: [null, null, null, null],
    windows: [null, null, null, null],
    stack: [null, null, null, null, null],
    carriage: null,
    plunger: null,
    jawBack: null,
    jawFront: null,
    housing: null,
    plate: null,
    coilBack: null,
    coilFront: null,
    vectorFront: null,
    card: null,
    rules: null,
    ghost: null,
    needle: null,
  });
  const latchRef = React.useRef<SolidNodes>(solidNodes());
  const drawerRef = React.useRef<SolidNodes>(solidNodes());
  const flapRef = React.useRef<SolidNodes>(solidNodes());
  const cardRef = React.useRef<SolidNodes>(solidNodes());
  const earRef = React.useRef<SolidNodes>(solidNodes());

  const bench = React.useRef<BenchState>(REST);
  const pending = React.useRef<BenchInput>({});
  const latch = React.useRef<Spring>({ at: restPose.latch, rate: 0 });
  const count = React.useRef(restPose.count);
  const frame = React.useRef(0);
  const last = React.useRef(0);
  const touring = React.useRef(false);
  const tourLoop = React.useRef(0);
  const tourIdle = React.useRef(0);
  const spoken = React.useRef("");

  const [visible, setVisible] = React.useState(false);
  const [engaged, setEngaged] = React.useState(false);
  const [idle, setIdle] = React.useState(true);
  const [poke, setPoke] = React.useState(0);

  const rest = React.useMemo(() => {
    const card = cardPathsOf(restPose.card);
    return { coil: coilOf(restPose.plate), latch: latchOf(restPose.latch), flap: flapOf(0), card, needle: needleOf(restPose.count) };
  }, []);

  const draw = React.useCallback((pose: Pose, latchAt: number, shown: number) => {
    const n = nodes.current;
    pose.carts.forEach((cart, index) => {
      const inRack = cart.layer === "rack";
      const rackNode = n.rack[index];
      const socketNode = n.socket[index];
      const place = shift(cart.x, 0, cart.z);
      if (rackNode) {
        rackNode.setAttribute("transform", place);
        if (inRack) rackNode.removeAttribute("display");
        else rackNode.setAttribute("display", "none");
      }
      if (socketNode) {
        socketNode.setAttribute("transform", place);
        if (inRack) socketNode.setAttribute("display", "none");
        else socketNode.removeAttribute("display");
        if (bench.current.seated === index) socketNode.dataset.seated = "";
        else delete socketNode.dataset.seated;
      }
    });
    const { picker } = pose;
    n.carriage?.setAttribute("transform", shift(picker.x));
    n.housing?.setAttribute("transform", shift(picker.x));
    n.plunger?.setAttribute("transform", shift(picker.x, 0, picker.grip));
    n.jawBack?.setAttribute("transform", shift(picker.x - picker.open * JAW_TRAVEL, 0, picker.grip));
    n.jawFront?.setAttribute("transform", shift(picker.x + picker.open * JAW_TRAVEL, 0, picker.grip));
    n.plate?.setAttribute("transform", shift(0, 0, pose.plate - PLATE_EMPTY));
    const coil = coilOf(pose.plate);
    n.coilBack?.setAttribute("d", coil.back);
    n.coilFront?.setAttribute("d", coil.front);
    applySolid(latchRef, latchOf(latchAt));
    applySolid(drawerRef, drawerBodyOf(pose.drawer));
    n.vectorFront?.setAttribute("transform", shift(0, pose.drawer, 0));
    n.windows.forEach((node, index) => {
      if (!node) return;
      if (pose.window === index) node.removeAttribute("display");
      else node.setAttribute("display", "none");
    });
    n.stack.forEach((node, index) => {
      if (!node) return;
      if (index < pose.stack) node.removeAttribute("display");
      else node.setAttribute("display", "none");
    });
    applySolid(flapRef, flapOf(pose.flap));
    if (n.card) {
      if (pose.card.shown) {
        n.card.removeAttribute("display");
        n.card.style.opacity = pose.card.alpha < 1 ? `${Math.max(0, pose.card.alpha)}` : "";
        const card = cardPathsOf(pose.card);
        applySolid(cardRef, card.body);
        applySolid(earRef, card.ear);
        n.rules?.setAttribute("d", card.rules);
      } else n.card.setAttribute("display", "none");
    }
    if (n.ghost) n.ghost.style.opacity = `${Math.round(pose.ghost * 100) / 100}`;
    n.needle?.setAttribute("d", needleOf(shown));
  }, []);

  const describe = React.useCallback(() => {
    const text = spokenOf(bench.current);
    if (text === spoken.current) return;
    spoken.current = text;
    if (status.current) status.current.textContent = text;
    if (announcer.current && document.activeElement === root.current) announcer.current.textContent = text;
  }, []);

  const stop = React.useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
  }, []);

  const run = React.useCallback(() => {
    if (frame.current) return;
    last.current = 0;
    const tick = (now: number) => {
      const dt = last.current ? Math.min((now - last.current) / 1000, MOST_DT) : 1 / 60;
      last.current = now;
      const calm = asksForStillness();
      const input = pending.current;
      pending.current = {};
      let state = bench.current;
      if (touring.current && !calm && !busy(state) && input.pick === undefined && !input.run) {
        tourIdle.current += dt;
        if (tourIdle.current >= (tourLoop.current === 0 ? 0 : TOUR_GAP)) {
          tourIdle.current = 0;
          const loop = tourLoop.current++;
          const next = ((state.seated ?? 0) + 1) % CARTRIDGES.length;
          // Every third loop the card comes out malformed, to show the retry path.
          input.pick = next;
          input.run = { failures: loop % 3 === 2 ? 1 : 0 };
        }
      }
      state = calm ? settleNow(state, input) : step(state, input, dt);
      const wasSeated = bench.current.seated;
      bench.current = state;
      const pose = poseOf(state);
      const latchDone = spring(latch.current, pose.latch, dt, 420, 30, calm);
      count.current = follow(count.current, pose.count, dt, 0.18, calm);
      draw(pose, latch.current.at, count.current);
      say(readoutOf(state));
      if (state.phase === "idle" || wasSeated !== state.seated) describe();
      const moving = busy(state) || !latchDone || count.current !== pose.count;
      frame.current = moving || (touring.current && !calm) ? requestAnimationFrame(tick) : 0;
    };
    frame.current = requestAnimationFrame(tick);
  }, [draw, say, describe]);

  // Offscreen: stop. Onscreen and idle: tour after a moment.
  React.useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => setVisible(Boolean(entries.at(-1)?.isIntersecting)), { rootMargin: "120px 0px" });
    observer.observe(node);
    return () => {
      observer.disconnect();
      stop();
    };
  }, [stop]);

  React.useEffect(() => {
    if (engaged) return;
    const timer = window.setTimeout(() => setIdle(true), TOUR_BACK);
    return () => window.clearTimeout(timer);
  }, [engaged, poke]);

  React.useEffect(() => {
    if (!visible) {
      touring.current = false;
      stop();
      return;
    }
    if (idle && !engaged && !asksForStillness()) {
      const timer = window.setTimeout(() => {
        touring.current = true;
        tourIdle.current = 0;
        run();
      }, TOUR_FIRST);
      return () => {
        window.clearTimeout(timer);
        touring.current = false;
      };
    }
    touring.current = false;
    if (busy(bench.current)) run();
  }, [visible, idle, engaged, run, stop]);

  const wake = () => {
    touring.current = false;
    setIdle(false);
    setPoke((value) => value + 1);
  };

  const act = (input: BenchInput) => {
    wake();
    pending.current = { ...pending.current, ...input };
    run();
  };

  const target = () => {
    const state = bench.current;
    return pending.current.pick ?? state.want ?? (state.phase === "unseat" || state.phase === "fetch" || state.phase === "seat" ? state.next : (state.seated ?? 0));
  };

  const carts = (props.layers.find((layer) => layer.id === "rackCarts")?.art ?? []) as React.ReactNode[];
  const list = (art: React.ReactNode | React.ReactNode[]) => (Array.isArray(art) ? art : [art]);

  // Each part in its painter's slot; the moving ones wrapped in the refs the loop writes to.
  const slot = (id: PartId, art: React.ReactNode | React.ReactNode[]): React.ReactNode => {
    switch (id) {
      case "drawer":
        return <LiveSolid slotRef={drawerRef} paths={null} tone="mid" crease="faint" />;
      case "vectorFront":
        return <g ref={(node) => void (nodes.current.vectorFront = node)}>{art}</g>;
      case "rackCarts":
        return carts.map((cart, index) => (
          <g
            key={`rack-${index}`}
            ref={(node) => {
              nodes.current.rack[index] = node;
            }}
            className="bench-cart"
            data-part={index}
            transform={shift(restPose.carts[index]!.x, 0, restPose.carts[index]!.z)}
            display={restPose.carts[index]!.layer === "rack" ? undefined : "none"}
          >
            <title>{CARTRIDGES[index]}</title>
            {cart}
          </g>
        ));
      case "coilBack":
        return <path ref={(node) => void (nodes.current.coilBack = node)} className="iso-line bench-coil" data-tone="lo" d={rest.coil.back} />;
      case "coilFront":
        return <path ref={(node) => void (nodes.current.coilFront = node)} className="iso-line bench-coil" data-tone="mid" d={rest.coil.front} />;
      case "seatPlate":
        return (
          <g ref={(node) => void (nodes.current.plate = node)} transform={shift(0, 0, restPose.plate - PLATE_EMPTY)}>
            {art}
          </g>
        );
      case "jawBack":
        return (
          <g ref={(node) => void (nodes.current.jawBack = node)} transform={shift(restPose.picker.x - JAW_TRAVEL, 0, restPose.picker.grip)}>
            {art}
          </g>
        );
      case "socketCarts":
        return carts.map((cart, index) => (
          <g
            key={`socket-${index}`}
            ref={(node) => {
              nodes.current.socket[index] = node;
            }}
            className="bench-cart"
            data-part={index}
            data-seated={REST.seated === index ? "" : undefined}
            transform={shift(restPose.carts[index]!.x, 0, restPose.carts[index]!.z)}
            display={restPose.carts[index]!.layer === "socket" ? undefined : "none"}
          >
            <title>{`${CARTRIDGES[index]} (seated)`}</title>
            {cart}
          </g>
        ));
      case "windowDots":
        return list(art).map((dots, index) => (
          <g
            key={`window-${index}`}
            ref={(node) => {
              nodes.current.windows[index] = node;
            }}
            display={restPose.window === index ? undefined : "none"}
          >
            {dots}
          </g>
        ));
      case "latch":
        return <LiveSolid slotRef={latchRef} paths={rest.latch} tone="mid" crease="faint" />;
      case "carriage":
        return (
          <g ref={(node) => void (nodes.current.carriage = node)} transform={shift(restPose.picker.x)}>
            {art}
          </g>
        );
      case "plunger":
        return (
          <g ref={(node) => void (nodes.current.plunger = node)} transform={shift(restPose.picker.x, 0, restPose.picker.grip)}>
            {art}
          </g>
        );
      case "jawFront":
        return (
          <g ref={(node) => void (nodes.current.jawFront = node)} transform={shift(restPose.picker.x + JAW_TRAVEL, 0, restPose.picker.grip)}>
            {art}
          </g>
        );
      case "housing":
        return (
          <g ref={(node) => void (nodes.current.housing = node)} transform={shift(restPose.picker.x)}>
            {art}
          </g>
        );
      case "flap":
        return <LiveSolid slotRef={flapRef} paths={rest.flap} tone="mid" crease="faint" />;
      case "stack":
        return list(art).map((plate, index) => (
          <g
            key={`stack-${index}`}
            ref={(node) => {
              nodes.current.stack[index] = node;
            }}
            display={index < restPose.stack ? undefined : "none"}
          >
            {plate}
          </g>
        ));
      case "ghost":
        return (
          <g ref={(node) => void (nodes.current.ghost = node)} style={{ opacity: 0 }}>
            {art}
          </g>
        );
      case "card":
        return (
          <g ref={(node) => void (nodes.current.card = node)} className="bench-card">
            <LiveSolid slotRef={cardRef} paths={rest.card.body} tone="hi" crease="lo" lit />
            <LiveSolid slotRef={earRef} paths={rest.card.ear} tone="hi" crease="lo" lit />
            <path ref={(node) => void (nodes.current.rules = node)} className="iso-line" data-tone="lo" data-free="" d={rest.card.rules} />
          </g>
        );
      case "needle":
        return <path ref={(node) => void (nodes.current.needle = node)} className="iso-line bench-needle" data-tone="hi" d={rest.needle} />;
      default:
        return art;
    }
  };

  return (
    <div
      ref={(node) => {
        root.current = node;
        anchorRef.current = node;
      }}
      className="bench"
      role="group"
      tabIndex={0}
      aria-roledescription="interactive figure"
      aria-label="Model bench. Left and right arrow keys seat the previous or next model; Space runs an output card through the gauge; Shift and Space runs a malformed one."
      aria-describedby={describedBy}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        setEngaged(true);
        setIdle(false);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setEngaged(false);
      }}
      onFocus={() => {
        setEngaged(true);
        setIdle(false);
        if (announcer.current) announcer.current.textContent = spokenOf(bench.current);
      }}
      onBlur={() => setEngaged(false)}
      onClick={(event) => {
        const part = (event.target as Element).closest<SVGGElement>("[data-part]");
        const index = part ? Number(part.dataset.part) : NaN;
        if (Number.isInteger(index)) act({ pick: index });
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault();
          const by = event.key === "ArrowRight" ? 1 : -1;
          act({ pick: (target() + by + CARTRIDGES.length) % CARTRIDGES.length });
        } else if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          if (event.repeat) return;
          act({ run: { failures: event.shiftKey ? 1 : 0 } });
        }
      }}
    >
      <span ref={status} id={describedBy} className="bench-sr">
        {spokenOf(REST)}
      </span>
      <span ref={announcer} className="bench-sr" aria-live="polite" />
      <IsoFigure width={WIDTH} height={HEIGHT} label={props.label}>
        {props.layers.map((layer) => (
          <React.Fragment key={layer.id}>{slot(layer.id, layer.art)}</React.Fragment>
        ))}
      </IsoFigure>
    </div>
  );
}
