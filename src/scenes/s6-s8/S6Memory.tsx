import { Scene, SceneHeading, SceneSlot } from "@/components/scene/Scene";
import { BenchFigure, BenchLegend } from "@/components/figures/bench/figure";

// PLACEHOLDER (phase 0). Owner: 1C. The v1 bench, reused as is.
export function S6Memory() {
  return (
    <Scene id="memory" layout="card">
      <SceneSlot slot="figure">
        <BenchFigure />
        <BenchLegend />
      </SceneSlot>
      <SceneSlot slot="text">
        <SceneHeading id="memory">Memory that travels</SceneHeading>
        <p>
          In November 2024 the Model Context Protocol gave models a standard way to reach context. Models change every few months; the memory should
          stay.
        </p>
        <p>
          DecentralMem.AI keeps one project memory behind an MCP server. The Claude adapter runs today; the GPT-4o, Gemini and local adapters are
          designed and stubbed.
        </p>
      </SceneSlot>
    </Scene>
  );
}
