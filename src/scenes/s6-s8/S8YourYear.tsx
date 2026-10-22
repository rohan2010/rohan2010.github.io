import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";
import { EMAIL, GITHUB, LINKEDIN, RESUME_HREF, RESUME_READY } from "@/content/site";

// PLACEHOLDER (phase 0). Owner: 1C. The blank card calls back to scene 0's
// punched hole; 1C makes the links punch it.
const HOLES = 18;

export function S8YourYear() {
  return (
    <Scene id="your-year" layout="closing">
      <SceneSlot slot="wide">
        <div className="s8-card" aria-hidden="true">
          <span className="t-year" data-mono="">
            2027
          </span>
          <span className="s8-holes">
            {Array.from({ length: HOLES }, (_, i) => (
              <i key={i} />
            ))}
          </span>
        </div>
      </SceneSlot>
      <SceneSlot slot="text">
        <SceneHeading id="your-year">Your year</SceneHeading>
        <p className="t-h3">The next one’s a collaboration.</p>
        <p>
          <a className="link" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </p>
        <ul className="s8-links">
          <li>
            <a className="link" href={LINKEDIN} rel="noreferrer">
              LinkedIn
            </a>
          </li>
          <li>
            <a className="link" href={GITHUB} rel="noreferrer">
              GitHub
            </a>
          </li>
          {RESUME_READY ? (
            <li>
              <a className="link" href={RESUME_HREF}>
                Résumé (PDF)
              </a>
            </li>
          ) : null}
        </ul>
        <p className="t-caption">Delhi, open to relocating, can start now.</p>
      </SceneSlot>
    </Scene>
  );
}
