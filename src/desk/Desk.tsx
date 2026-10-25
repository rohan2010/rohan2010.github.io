import { getProjects } from "@/content/projects";
import { DESK_CSS, DESK_SVG } from "./desk-art";
import { DeskLive } from "./DeskLive";
import "./iso.css";
import "./desk.css";

// The desk figure: static art from figures/desk/build.mjs, made interactive by DeskLive.
export function Desk() {
  const projects = getProjects().map(({ slug, name, oneLine, status, year, readmeHtml, links, demo, caseStudy, design }) => ({
    slug,
    name,
    oneLine,
    status,
    year,
    readmeHtml,
    links,
    demo,
    caseStudy,
    design,
  }));
  return (
    <div className="iso desk" data-theme="light">
      <DeskLive svg={DESK_SVG} css={DESK_CSS} projects={projects} />
    </div>
  );
}
