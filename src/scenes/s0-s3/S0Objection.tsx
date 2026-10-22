import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";
import { site } from "@/content/site";
import { sourceById } from "@/content/sources";

// PLACEHOLDER (phase 0). Owner: 1A. Draft copy from concepts.md storyboard.
const NOTE_G = sourceById("lovelace-note-g");

export function S0Objection() {
  return (
    <Scene id="objection" layout="statement">
      <SceneSlot slot="wide">
        <blockquote className="s0-quote">
          <p className="t-display">“It can do whatever we know how to order it to perform.”</p>
          <footer className="t-caption">
            Ada Lovelace, <cite>Note G</cite>, <span className="t-year" data-mono="">1843</span>.{" "}
            <a className="link" href={NOTE_G.url} rel="noreferrer">
              Source
            </a>
          </footer>
        </blockquote>
      </SceneSlot>
      <SceneSlot slot="text">
        <SceneHeading id="objection" level={1} size="h3" years={false}>
          {site.name}
        </SceneHeading>
        <p className="measure">{site.line}</p>
        <p className="t-caption">Full-stack + AI engineer · Purdue M.S. HCI</p>
        <p>
          <a className="link" href="#ruler">
            Start in 1843 ↓
          </a>
        </p>
      </SceneSlot>
    </Scene>
  );
}
