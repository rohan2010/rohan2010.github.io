import { Dots, Line, Solid } from "@/components/iso/react/draw";
import { BASE_ART, CARD, HOPPER_ART, RULER_ART } from "./geometry";
import { CardFeedLive } from "./live";

// Server component: the static parts as keyed JSX constants (anatomy react.md:
// key every element prop's root), handed to the ONE client component, which
// places them in painter's order and moves the card.

const UNDER = (
  <g key="under">
    <path className="iso-halo" d={BASE_ART.halo} />
    {BASE_ART.feet.map((paths, index) => (
      <Solid key={index} paths={paths} tone="lo" />
    ))}
    <Solid paths={BASE_ART.plate} tone="lo" />
    <Line d={BASE_ART.groove} tone="faint" />
    <Dots points={BASE_ART.screws} size={0.55} tone="mid" />
    <Solid paths={RULER_ART.strip} tone="mid" />
    <Line d={RULER_ART.ticks.minor} tone="lo" />
    <Line d={RULER_ART.ticks.major} tone="mid" />
    <Solid paths={HOPPER_ART.wall} tone="mid" />
    <Solid paths={HOPPER_ART.tray} tone="mid" />
    <Line d={HOPPER_ART.trayGroove} tone="faint" />
    <Solid paths={HOPPER_ART.stack} tone="mid" inner={<Line d={HOPPER_ART.seams} tone="faint" />} />
  </g>
);

const CARD_ART = (
  <g key="card">
    <Solid paths={CARD.slab} tone="hi" lit />
    <Dots points={CARD.holes} size={0.7} tone="hi" />
  </g>
);

export function CardFeedArt() {
  return <CardFeedLive under={UNDER} card={CARD_ART} />;
}
