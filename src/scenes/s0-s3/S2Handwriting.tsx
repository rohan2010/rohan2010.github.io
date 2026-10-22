import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";

// PLACEHOLDER (phase 0). Owner: 1A. The static before/after pair below is the
// reduced-motion / JS-off form of the envelope → phone morph.
export function S2Handwriting() {
  return (
    <Scene id="handwriting" layout="split">
      <SceneSlot slot="figure">
        <dl className="rhyme-pair">
          <div>
            <dt className="t-year" data-mono="">1989</dt>
            <dd>A network reads handwritten ZIP codes for the US Postal Service.</dd>
          </div>
          <div>
            <dt className="t-year" data-mono="">2021</dt>
            <dd>A network reads handwritten digits on a phone, offline, with a person checking the hardest 15%.</dd>
          </div>
        </dl>
      </SceneSlot>
      <SceneSlot slot="text">
        <SceneHeading id="handwriting">Reading handwriting</SceneHeading>
        <p>
          In 1989 a convolutional network learned to read ZIP codes from the US Postal Service. In 2021 I put one on a phone for Container Corporation of
          India: an edge CNN in TensorFlow Lite inside a Flutter app, so it worked offline on site.
        </p>
        <p>The 15% of digits it was least sure of went to a person, and their answers retrained it.</p>
      </SceneSlot>
    </Scene>
  );
}
