import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";
import { CardFeedFigure } from "@/figures/_example/figure";

// PLACEHOLDER (phase 0). Owner: 1B. The figure here is the lead's wiring
// example (src/figures/_example/): replace it with the sorter → pockets morph.
export function S4Taught() {
  return (
    <Scene id="taught" layout="centered">
      <SceneSlot slot="figure">
        <CardFeedFigure />
      </SceneSlot>
      <SceneSlot slot="text">
        <SceneHeading id="taught">What are they taught?</SceneHeading>
        <p>In 1890 punched cards counted what a country is made of. In 2024 we counted what a model is taught.</p>
        <p>
          Value Imprint audited 6,501 RLHF annotations from Anthropic’s hh-rlhf, OpenAI’s WebGPT and Alpaca GPT-4, and found a lean toward
          information-utility over prosocial values. A team paper at NeurIPS 2024.
        </p>
      </SceneSlot>
    </Scene>
  );
}
