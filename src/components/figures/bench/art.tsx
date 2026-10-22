import * as React from "react";
import { Dots, FaceText, Line, Solid, Wire } from "@/components/iso/react/draw";
import { CARTRIDGES } from "./model";
import {
  BASE_ART,
  CABINET_ART,
  CARRIAGE_ART,
  CARTRIDGE_ART,
  CART_HIT,
  CHUTE_ART,
  DIAL_ART,
  DRAWER_ART,
  DRIVER_ART,
  DRIVER_CABLE,
  EVAL_SET_ART,
  GANTRY_ART,
  GAUGE_ART,
  GHOST,
  PLUNGER_ART,
  RACK_ART,
  SOCKET_ART,
  TRACK_ART,
  TRAY_ART,
} from "./geometry";
import { BenchLive } from "./live";
import type { Layer } from "./layers";
import { at, CAB_FRONT, PLATE_EMPTY, PLATE_T, RIBBON_X, BLOCK_H } from "./view";
import { box } from "./shapes";
import { P } from "./view";

// Static parts as keyed JSX constants (server). The live component places them
// in painter's order and moves the ones that move. Every element prop's root
// has a key (see the anatomy skill's react.md, "large-page key-warning trap").

const BASE = (
  <g key="base">
    <path className="iso-halo" d={BASE_ART.halo} />
    {BASE_ART.feet.map((parts, index) => (
      <g key={index}>
        {parts.map((paths, part) => (
          <Solid key={part} paths={paths} tone={part ? "mid" : "lo"} crease="faint" />
        ))}
      </g>
    ))}
    <Solid paths={BASE_ART.slab} tone="mid" crease="faint" />
    <Line d={BASE_ART.groove} tone="lo" />
    <Line d={BASE_ART.screwRings} tone="lo" />
    <Dots points={BASE_ART.screws} size={0.5} tone="mid" />
  </g>
);

// The label plate and the front ruler strip, painted after the retry path as before.
const BASE_TOP = (
  <g key="base-top">
    <Solid paths={BASE_ART.label} tone="lo" crease="none" />
    <Line d={BASE_ART.labelLine} tone="faint" />
    <Line d={BASE_ART.labelRule} tone="lo" free />
    <Dots points={BASE_ART.labelScrews} size={0.45} tone="mid" />
    <Solid paths={BASE_ART.strip} tone="lo" crease="none" />
    <Line d={BASE_ART.stripMinor} tone="lo" />
    <Line d={BASE_ART.stripMajor} tone="mid" />
    <Line d={BASE_ART.stripZero} tone="hi" />
  </g>
);

// The retry path painted on the bench, from the return bin back to the line start.
// Its own layer so a detail can draw it with the chute.
const RETRY_PATH = <Line key="retry-path" d={BASE_ART.retryPath} tone="mid" dotted className="bench-retry" />;

const drawer = (index: number) => {
  const art = DRAWER_ART[index]!;
  return (
    <g key={`drawer-${index}`}>
      <Solid paths={art.front} tone="mid" crease="faint" />
      <Dots points={art.rivets} size={0.4} tone="mid" />
      <Solid paths={art.holder.frame} tone="lo" crease="none" />
      <path className="bench-card-slip" d={art.holder.card} />
      <Line d={art.holder.card} tone="faint" />
      {art.posts.map((paths, post) => (
        <Solid key={post} paths={paths} tone="mid" crease="none" />
      ))}
      <Solid paths={art.bar} tone="mid" crease="faint" />
    </g>
  );
};

const CABINET = (
  <g key="cabinet">
    <path className="iso-halo" d={CABINET_ART.halo} />
    <Solid paths={CABINET_ART.plinth} tone="lo" crease="faint" />
    <Solid paths={CABINET_ART.case} tone="mid" crease="faint" inner={<Line d={CABINET_ART.band} tone="faint" />} />
    <Solid paths={CABINET_ART.top} tone="mid" crease="faint" />
    <Dots points={CABINET_ART.topScrews} size={0.45} tone="mid" />
    <Line d={CABINET_ART.panel} tone="faint" />
    {drawer(0)}
    {drawer(2)}
    <Solid paths={CABINET_ART.connector} tone="lo" crease="faint" />
    <Dots points={CABINET_ART.connectorPins} size={0.35} tone="hi" />
    <Dots points={CABINET_ART.connectorScrews} size={0.45} tone="mid" />
  </g>
);

const VECTOR_FRONT = drawer(1);

const GANTRY = (
  <g key="gantry">
    {GANTRY_ART.posts.map((post, index) => (
      <g key={index}>
        <path className="iso-halo bench-soft" d={post.foot.fill} />
        <Solid paths={post.foot} tone="lo" crease="faint" />
        <Dots points={post.footScrews} size={0.45} tone="mid" />
        <Solid paths={post.collar} tone="mid" crease="faint" />
        <Solid paths={post.post} tone="mid" crease="faint" inner={<Line d={post.band} tone="faint" />} />
        <Solid paths={post.cap} tone="mid" crease="faint" />
      </g>
    ))}
    <Solid paths={GANTRY_ART.beam} tone="mid" crease="faint" inner={<Line d={GANTRY_ART.ruleBase} tone="faint" />} />
    <Line d={GANTRY_ART.ruleMinor} tone="lo" />
    <Line d={GANTRY_ART.ruleMajor} tone="mid" />
    <Dots points={GANTRY_ART.beamScrews} size={0.45} tone="mid" />
    {GANTRY_ART.stops.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="faint" />
    ))}
    <Dots points={GANTRY_ART.stopScrews} size={0.4} tone="mid" />
    <path className="iso-halo bench-soft" d={DRIVER_ART.halo} />
    <Solid paths={DRIVER_ART.body} tone="mid" crease="faint" />
    <Solid paths={DRIVER_ART.lid} tone="mid" crease="faint" />
    <Dots points={DRIVER_ART.lidScrews} size={0.4} tone="mid" />
    <Line d={DRIVER_ART.vents} tone="lo" />
    <Line d={DRIVER_ART.lampRing} tone="faint" />
    <Dots points={DRIVER_ART.lamps} size={0.6} tone="hi" />
    <Solid paths={DRIVER_ART.plug} tone="lo" crease="none" />
    <Wire from={DRIVER_CABLE.from} to={DRIVER_CABLE.to} via={DRIVER_CABLE.via} tone="lo" size={0.9} />
  </g>
);

const RACK_BACK = (
  <g key="rack-back">
    <path className="iso-halo bench-soft" d={RACK_ART.base.fill} />
    <Solid paths={RACK_ART.base} tone="lo" crease="faint" />
    <Line d={RACK_ART.floorLine} tone="faint" />
    <Solid paths={RACK_ART.back} tone="mid" crease="faint" />
    {RACK_ART.dividers.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" crease="none" />
    ))}
  </g>
);

const RACK_FRONT = (
  <g key="rack-front">
    <Solid paths={RACK_ART.front} tone="mid" crease="faint" inner={<Line d={RACK_ART.frontSeam} tone="faint" />} />
    <Line d={RACK_ART.slotMarks} tone="lo" />
    {RACK_ART.detents.map((detent, index) => (
      <g key={index}>
        <Line d={detent.seat} tone="faint" />
        <Line d={detent.coil.back} tone="lo" />
        <Solid paths={detent.pin} tone="mid" crease="none" />
        <Line d={detent.coil.front} tone="mid" />
        <Solid paths={detent.cap} tone="mid" crease="faint" />
      </g>
    ))}
    <Dots points={RACK_ART.cheekScrews} size={0.45} tone="mid" />
  </g>
);

const cartridge = (index: number) => {
  const art = CARTRIDGE_ART[index]!;
  return (
    <g key={`cart-${index}`}>
      <path className="bench-hit" d={CART_HIT} />
      <Solid paths={art.strip} tone="lo" crease="none" />
      <Solid paths={art.shell} tone="mid" crease="faint" className="bench-shell" inner={<Line d={art.grip + art.label} tone="lo" />} />
      {art.notches.map((d, notch) => (
        <g key={notch}>
          <path className="iso-shade" data-shade="0" d={d} />
          <Line d={d} tone="lo" />
        </g>
      ))}
      <Dots points={art.marks} size={0.4} tone="lo" />
    </g>
  );
};

const CARTS = CARTRIDGES.map((_, index) => cartridge(index));

const SOCKET_BACK = (
  <g key="socket-back">
    <path className="iso-halo bench-soft" d={SOCKET_ART.halo} />
    <Solid paths={SOCKET_ART.left} tone="mid" crease="faint" inner={<Line d={SOCKET_ART.leftSeam} tone="faint" />} />
    <Solid paths={SOCKET_ART.railL} tone="mid" crease="none" />
    <Line d={SOCKET_ART.pinRow} tone="faint" />
    <Dots points={SOCKET_ART.pins} size={0.4} tone="hi" />
    <Dots points={SOCKET_ART.screwsL} size={0.45} tone="mid" />
    <Solid paths={SOCKET_ART.boss} tone="lo" crease="faint" />
  </g>
);

const PIN = <Solid key="pin" paths={SOCKET_ART.pin} tone="mid" crease="none" />;

// The seat plate, built at its empty height; live moves it down as a cartridge presses it.
const SEAT_PLATE = (
  <g key="seat-plate">
    <Solid paths={box([-5, -20, PLATE_EMPTY], [5, 30, PLATE_EMPTY + PLATE_T], P)} tone="mid" crease="faint" />
    <Dots points={[at([0, 24, PLATE_EMPTY + PLATE_T]), at([0, 28, PLATE_EMPTY + PLATE_T])]} size={0.4} tone="mid" />
  </g>
);

const SOCKET_FRONT = (
  <g key="socket-front">
    <Solid paths={SOCKET_ART.right} tone="mid" crease="faint" inner={<Line d={SOCKET_ART.rightSeam} tone="faint" />} />
    <Solid paths={SOCKET_ART.railR} tone="mid" crease="none" />
    <Dots points={SOCKET_ART.screwsR} size={0.45} tone="mid" />
    <Solid paths={SOCKET_ART.socketConnector} tone="lo" crease="faint" />
    <path className="iso-shade" data-shade="0" d={SOCKET_ART.window} />
    <Line d={SOCKET_ART.window} tone="lo" />
    <Line d={SOCKET_ART.windowInner} tone="faint" />
    <FaceText transform={SOCKET_ART.label} size={2.4} tone="lo">
      MODEL
    </FaceText>
    <path className="iso-shade" data-shade="0" d={SOCKET_ART.exit} />
    <Line d={SOCKET_ART.exit} tone="lo" />
    <Line d={SOCKET_ART.latchBoss} tone="lo" />
    <Solid paths={SOCKET_ART.latchStop} tone="lo" crease="none" />
  </g>
);

const WINDOW_DOTS = SOCKET_ART.windowDots.map((dots, index) => (
  <g key={`window-${index}`}>
    <Dots points={dots.filter((dot) => dot.on).map((dot) => dot.at)} size={0.75} tone="hi" />
    <Dots points={dots.filter((dot) => !dot.on).map((dot) => dot.at)} size={0.5} tone="faint" />
  </g>
));

const LATCH_PIN = <Dots key="latch-pin" points={[SOCKET_ART.latchPin]} size={0.7} tone="hi" />;

const RIBBON = (
  <Wire
    key="ribbon"
    from={at([RIBBON_X, CAB_FRONT + 3, 22.5])}
    to={at([RIBBON_X, -17.2, BLOCK_H + 4])}
    via={[at([RIBBON_X, -44, 21.2]), at([RIBBON_X, -30, 21.6]), at([RIBBON_X, -21, 23.4])]}
    tone="mid"
    size={0.9}
  />
);

const CARRIAGE = (
  <g key="carriage">
    {CARRIAGE_ART.bushings.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" crease="none" />
    ))}
    <Solid paths={CARRIAGE_ART.body} tone="mid" crease="faint" />
    <Dots points={CARRIAGE_ART.screws} size={0.45} tone="mid" />
    <Solid paths={CARRIAGE_ART.rider} tone="mid" crease="none" />
    <Line d={CARRIAGE_ART.riderTick} tone="hi" />
    <Solid paths={CARRIAGE_ART.arm} tone="mid" crease="faint" />
    <Dots points={CARRIAGE_ART.armScrews} size={0.4} tone="mid" />
  </g>
);

const JAW_BACK = <Solid key="jaw-back" paths={PLUNGER_ART.jawBack} tone="mid" crease="none" />;

const PLUNGER = (
  <g key="plunger">
    <Solid paths={PLUNGER_ART.rod} tone="mid" crease="none" inner={<Line d={PLUNGER_ART.rodMarks} tone="lo" />} />
    <Solid paths={PLUNGER_ART.collar} tone="mid" crease="faint" />
    <Solid paths={PLUNGER_ART.bridge} tone="mid" crease="faint" />
    <Dots points={PLUNGER_ART.bridgeScrews} size={0.4} tone="mid" />
  </g>
);

const JAW_FRONT = (
  <g key="jaw-front">
    <Solid paths={PLUNGER_ART.jawFront} tone="mid" crease="none" />
  </g>
);

const HOUSING = (
  <g key="housing">
    <Solid paths={CARRIAGE_ART.collar} tone="mid" crease="faint" />
    <Solid paths={CARRIAGE_ART.housing} tone="mid" crease="none" inner={<Line d={CARRIAGE_ART.seams} tone="faint" />} />
    <Solid paths={CARRIAGE_ART.cap} tone="mid" crease="faint" />
    <Solid paths={CARRIAGE_ART.knob} tone="mid" crease="faint" inner={<Line d={CARRIAGE_ART.knobKnurl} tone="lo" />} />
    <Line d={CARRIAGE_ART.knobPointer} tone="hi" />
  </g>
);

const EVAL_SET = (
  <g key="eval-set">
    <path className="iso-halo bench-soft" d={EVAL_SET_ART.halo} />
    <Solid paths={EVAL_SET_ART.floor} tone="lo" crease="none" />
    <Solid paths={EVAL_SET_ART.back} tone="mid" crease="none" />
    <Solid paths={EVAL_SET_ART.left} tone="mid" crease="none" />
    {EVAL_SET_ART.cards.map((paths, index) => (
      <Solid key={`c${index}`} paths={paths} tone="lo" crease="none" />
    ))}
    {EVAL_SET_ART.dividers.map((paths, index) => (
      <Solid key={`d${index}`} paths={paths} tone="mid" crease="none" />
    ))}
    <Solid paths={EVAL_SET_ART.front} tone="mid" crease="none" />
    <Solid paths={EVAL_SET_ART.right} tone="mid" crease="none" />
    <Solid paths={EVAL_SET_ART.holder} tone="lo" crease="none" />
    <path className="bench-card-slip" d={EVAL_SET_ART.slip} />
    <Line d={EVAL_SET_ART.slip} tone="faint" />
    <Solid paths={EVAL_SET_ART.pull} tone="mid" crease="none" />
    <Dots points={EVAL_SET_ART.rivets} size={0.4} tone="mid" />
  </g>
);

const TRACK_BED = (
  <g key="track-bed">
    <path className="iso-halo bench-soft" d={TRACK_ART.bedA.fill} />
    <Solid paths={TRACK_ART.pit} tone="lo" crease="none" />
    <Solid paths={TRACK_ART.bedA} tone="lo" crease="faint" />
    <Solid paths={TRACK_ART.bedB} tone="lo" crease="faint" />
    <Solid paths={TRACK_ART.railBack} tone="mid" crease="faint" />
    <Dots points={TRACK_ART.railScrewsBack} size={0.4} tone="mid" />
    {TRACK_ART.rollers.map((paths, index) => (
      <Solid key={index} paths={paths} tone="mid" crease="lo" />
    ))}
  </g>
);

const CHUTE_BACK = (
  <g key="chute-back">
    <Solid paths={CHUTE_ART.floor} tone="lo" crease="faint" />
    <Solid paths={CHUTE_ART.wallBack} tone="mid" crease="none" />
    <Solid paths={CHUTE_ART.binFloor} tone="lo" crease="none" />
    <Solid paths={CHUTE_ART.binBack} tone="mid" crease="none" />
    <Solid paths={CHUTE_ART.binLeft} tone="mid" crease="none" />
  </g>
);

const TRAY_BACK = (
  <g key="tray-back">
    <Solid paths={TRAY_ART.floor} tone="lo" crease="faint" />
    <Solid paths={TRAY_ART.back} tone="mid" crease="none" />
    <Solid paths={TRAY_ART.left} tone="mid" crease="none" />
  </g>
);

const GAUGE_BACK = (
  <g key="gauge-back">
    {GAUGE_ART.feet.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" crease="none" />
    ))}
    <Solid paths={GAUGE_ART.back} tone="mid" crease="faint" />
    <Line d={TRACK_ART.pivot} tone="mid" />
  </g>
);

const STACK = TRAY_ART.stack.map((paths, index) => (
  <g key={`stack-${index}`}>
    <Solid paths={paths} tone="mid" crease="faint" />
  </g>
));

const GHOST_CARD = <Line key="ghost" d={GHOST} tone="mid" dotted />;

const RAILS_FRONT = (
  <g key="rails-front">
    <Solid paths={TRACK_ART.railFrontA} tone="mid" crease="faint" />
    <Solid paths={TRACK_ART.railFrontB} tone="mid" crease="faint" />
    <Dots points={TRACK_ART.railScrewsFront} size={0.4} tone="mid" />
    <Dots points={TRACK_ART.axles} size={0.45} tone="mid" />
  </g>
);

const GAUGE_FRONT = (
  <g key="gauge-front">
    <Solid paths={GAUGE_ART.blade} tone="mid" crease="none" />
    <Solid paths={GAUGE_ART.bar} tone="mid" crease="faint" />
    <Dots points={GAUGE_ART.barScrews} size={0.45} tone="mid" />
    <Solid paths={GAUGE_ART.front} tone="mid" crease="faint" />
  </g>
);

const CHUTE_FRONT = (
  <g key="chute-front">
    <Solid paths={CHUTE_ART.wallFront} tone="mid" crease="none" />
    <Solid paths={CHUTE_ART.binFront} tone="mid" crease="none" />
    <Solid paths={CHUTE_ART.binRight} tone="mid" crease="none" />
  </g>
);

const TRAY_FRONT = (
  <g key="tray-front">
    <Solid paths={TRAY_ART.front} tone="mid" crease="faint" />
    <Solid paths={TRAY_ART.right} tone="mid" crease="faint" />
    <Dots points={TRAY_ART.frontScrews} size={0.4} tone="mid" />
  </g>
);

const DIAL = (
  <g key="dial">
    <Solid paths={DIAL_ART.base} tone="lo" crease="faint" />
    <Dots points={DIAL_ART.baseScrews} size={0.4} tone="mid" />
    <Solid paths={DIAL_ART.puck} tone="mid" crease="faint" inner={<Line d={DIAL_ART.band} tone="faint" />} />
    <Line d={DIAL_ART.knurl} tone="faint" />
    <Line d={DIAL_ART.bezel} tone="lo" />
    <Line d={DIAL_ART.minor} tone="lo" />
    <Line d={DIAL_ART.major} tone="mid" />
  </g>
);

const DIAL_HUB = <Line key="dial-hub" d={DIAL_ART.hubRing} tone="hi" />;

const LABEL =
  "A model test bench. A picker on a gantry lifts one of four model cartridges (Claude, GPT-4o, Gemini and a local LLM) from a rack and seats it in a socket. A memory cabinet behind the socket answers whichever model is seated, from the same namespace. Each output card the model makes rolls into a go/no-go gauge: a good card passes into the shipped tray and turns the counter; a malformed one is tipped into a return chute and the card is retried.";

/**
 * Every part of the bench in painter's order (back to front, bottom to top).
 * The hero's live figure draws this list as it is; a detail figure draws a
 * cropped subset of it, in the same order. Moving and per-frame parts have no
 * static art here (`art: null`) or carry the static art the live figure moves.
 */
export const LAYERS: Layer[] = [
  { id: "base", group: "base", art: BASE },
  { id: "retryPath", group: "chute", art: RETRY_PATH },
  { id: "baseTop", group: "base", art: BASE_TOP },
  { id: "cabinet", group: "cabinet", art: CABINET },
  { id: "drawer", group: "cabinet", art: null },
  { id: "vectorFront", group: "cabinet", art: VECTOR_FRONT },
  { id: "gantry", group: "gantry", art: GANTRY },
  { id: "rackBack", group: "rack", art: RACK_BACK },
  { id: "rackCarts", group: "rack", art: CARTS },
  { id: "rackFront", group: "rack", art: RACK_FRONT },
  { id: "socketBack", group: "socket", art: SOCKET_BACK },
  { id: "coilBack", group: "socket", art: null },
  { id: "pin", group: "socket", art: PIN },
  { id: "coilFront", group: "socket", art: null },
  { id: "seatPlate", group: "socket", art: SEAT_PLATE },
  { id: "jawBack", group: "picker", art: JAW_BACK },
  { id: "socketCarts", group: "socket", art: null }, // the same cartridges as the rack's, drawn in the socket's slot
  { id: "socketFront", group: "socket", art: SOCKET_FRONT },
  { id: "windowDots", group: "socket", art: WINDOW_DOTS },
  { id: "latch", group: "socket", art: null },
  { id: "latchPin", group: "socket", art: LATCH_PIN },
  { id: "ribbon", group: "cabinet", art: RIBBON },
  { id: "carriage", group: "picker", art: CARRIAGE },
  { id: "plunger", group: "picker", art: PLUNGER },
  { id: "jawFront", group: "picker", art: JAW_FRONT },
  { id: "housing", group: "picker", art: HOUSING },
  { id: "evalSet", group: "evalset", art: EVAL_SET },
  { id: "trackBed", group: "line", art: TRACK_BED },
  { id: "chuteBack", group: "chute", art: CHUTE_BACK },
  { id: "trayBack", group: "tray", art: TRAY_BACK },
  { id: "gaugeBack", group: "gauge", art: GAUGE_BACK },
  { id: "flap", group: "gauge", art: null },
  { id: "stack", group: "tray", art: STACK },
  { id: "ghost", group: "line", art: GHOST_CARD },
  { id: "card", group: "line", art: null },
  { id: "railsFront", group: "line", art: RAILS_FRONT },
  { id: "gaugeFront", group: "gauge", art: GAUGE_FRONT },
  { id: "chuteFront", group: "chute", art: CHUTE_FRONT },
  { id: "trayFront", group: "tray", art: TRAY_FRONT },
  { id: "dial", group: "dial", art: DIAL },
  { id: "needle", group: "dial", art: null },
  { id: "dialHub", group: "dial", art: DIAL_HUB },
];

export function BenchArt() {
  return <BenchLive label={LABEL} layers={LAYERS.map(({ id, art }) => ({ id, art }))} />;
}
