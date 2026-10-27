"use client";

import { DecodeText, type Part } from "./DecodeText";
import { Magnetic } from "./Magnetic";
import "./decode.css";

// The Playground's example hero: a headline that decodes itself when it scrolls into view, a
// subhead that follows once it has settled, and a button that leans toward the cursor. The
// product is made up.

const HEADLINE: Part[] = [{ text: "Every meeting ends with a " }, { text: "decision", accent: true }, { text: "." }];
const SUB = "Notes, owners and deadlines, written up before you're back at your desk.";

export function DecodeHeadline() {
  return (
    <section className="dh" aria-label="Example hero">
      <p className="dh-kicker">Minutes · for teams</p>
      <DecodeText parts={HEADLINE} as="h2" className="dh-h1">
        {(replay) => (
          <>
            <p className="dh-sub">{SUB}</p>
            <div className="dh-actions">
              <Magnetic>
                <a className="dh-cta" href="#" onClick={(e) => e.preventDefault()}>
                  <span data-magnetic-label>Try it free</span>
                </a>
              </Magnetic>
              <span className="dh-note">No card needed</span>
            </div>
            <button type="button" className="dh-replay" onClick={replay}>
              Replay
            </button>
          </>
        )}
      </DecodeText>
    </section>
  );
}
