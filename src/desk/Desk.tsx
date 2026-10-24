import { DESK_CSS, DESK_SVG } from "./desk-art";
import "./iso.css";

// The desk figure, static (step 1). Built by figures/desk/build.mjs.
export function Desk() {
  return (
    <div className="iso desk" data-theme="light">
      <style>{DESK_CSS}</style>
      <div dangerouslySetInnerHTML={{ __html: DESK_SVG }} />
    </div>
  );
}
