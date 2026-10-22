import Link from "next/link";
import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";
import { FORWARD, SharedElement, sharedName } from "@/lib/transitions";

// PLACEHOLDER (phase 0). Owner: 1C. The bloomScroll link shows the
// work-page pattern: a forward transition and a shared element.
export function S7Everyone() {
  return (
    <Scene id="everyone" layout="solo">
      <SceneSlot slot="text">
        <SceneHeading id="everyone">Next, for everyone</SceneHeading>
        <p>
          A future that is good for everyone has to fit on a budget phone and speak Hindi. BharatEdge-Eval asks what shrinking a small model costs Hindi
          and Hinglish users next to English users. Independent research, paper in preparation.
        </p>
        <p>
          <Link className="link" href="/work/bloomscroll/" transitionTypes={FORWARD}>
            <SharedElement name={sharedName("bloomscroll")}>
              <span>bloomScroll</span>
            </SharedElement>
          </Link>{" "}
          runs its model on your own computer.
        </p>
      </SceneSlot>
    </Scene>
  );
}
