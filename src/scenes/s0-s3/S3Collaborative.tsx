import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";

// PLACEHOLDER (phase 0). Owner: 1A. The memo sheet is drawn by 1A.
export function S3Collaborative() {
  return (
    <Scene id="collaborative" layout="sheet">
      <SceneSlot slot="wide">
        <p className="t-h2">
          “Collaborative filtering” <span className="t-year" data-mono="">1992</span>
        </p>
        <p className="t-caption">Tapestry, Xerox PARC: people annotate messages, and others filter by those annotations.</p>
      </SceneSlot>
      <SceneSlot slot="text">
        <SceneHeading id="collaborative">Collaborative</SceneHeading>
        <p>
          The field named itself after working together. At Let’s Dunch I built “Who to Meet”, a recommender in Python and scikit-learn that learned from what
          people actually did.
        </p>
        <p>I led a team of three through the redesign of the event booking flow, and registrations rose 30%.</p>
      </SceneSlot>
    </Scene>
  );
}
