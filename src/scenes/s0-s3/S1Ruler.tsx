import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";
import { scenes } from "@/content/scenes";

// PLACEHOLDER (phase 0). Owner: 1A. The map of the page (goal gradient):
// each row jumps to its scene.
const ROWS = scenes.filter((s) => s.n >= 2 && s.n <= 7);

export function S1Ruler() {
  return (
    <Scene id="ruler" layout="map">
      <SceneSlot slot="text">
        <SceneHeading id="ruler">180 years of machines learning to help.</SceneHeading>
        <p>Each step made machines useful to more people. Five of them rhyme with my work.</p>
      </SceneSlot>
      <SceneSlot slot="wide">
        <ol className="s1-map">
          {ROWS.map((scene) => (
            <li key={scene.id}>
              <a href={`#${scene.id}`}>
                <span className="t-year" data-mono="">
                  {scene.yearLabel}
                </span>
                <span>{scene.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </SceneSlot>
    </Scene>
  );
}
