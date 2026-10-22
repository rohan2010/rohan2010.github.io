import { Plate } from "@/components/iso/react/draw";
import { CardFeedArt } from "./art";
import { readoutOf } from "./model";

// The figure as placed in a scene (server). The resting readout renders on the
// server so it is right before hydration and with JS off.
// With JS off the card rests in the hopper (p = 0); the caption carries the story.
export function CardFeedFigure() {
  return (
    <Plate
      fig="Example"
      title="Card feed"
      hint="Scroll to feed"
      readout={readoutOf(0)}
      keys={[{ mark: "lit", label: "the card being fed (lit)" }]}
      caption="Illustrative. A hopper of punched cards; scrolling feeds the top card onto the tray. This is the wiring example for scene figures."
    >
      <CardFeedArt />
    </Plate>
  );
}
