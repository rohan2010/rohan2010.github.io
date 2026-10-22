// EXAMPLE SCENE (lead-owned reference, not rendered). Copy the pattern:
// - the scene file is a SERVER component: real heading, real text, static
//   figure. With JS off and under reduced motion it already tells the beat.
// - motion lives in small "use client" leaves inside it (ExampleProgressBar
//   below, or a figure's live.tsx), which read the scene via useScene/useScrub.
// See plans/v2/CONTRACTS.md §2.
import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";
import { CardFeedFigure } from "@/figures/_example/figure";
import { ExampleProgressBar } from "./ExampleProgressBar";

export function ExampleScene() {
  return (
    <Scene id="taught" layout="centered">
      <SceneSlot slot="figure">
        {/* server figure with ONE client live component inside (scrubbed by useScrub) */}
        <CardFeedFigure />
      </SceneSlot>
      <SceneSlot slot="text">
        <SceneHeading id="taught">What are they taught?</SceneHeading>
        <p>Text that stands on its own without the figure.</p>
        {/* a CSS-only detail scrubbed through one custom property (--p) */}
        <ExampleProgressBar />
      </SceneSlot>
    </Scene>
  );
}
