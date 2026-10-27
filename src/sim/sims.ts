import type { ComponentType } from "react";
import { CascadeSim } from "./CascadeSim";
import { MemorySim } from "./MemorySim";
import { ReviewSim } from "./ReviewSim";
import { ValuesSim } from "./ValuesSim";

// Every project's demo, keyed by the "demo" field in its project.json.
export const SIMS: Record<string, { name: string; note: string; Sim: ComponentType }> = {
  review: { name: "Review Simulator", note: "sample documents", Sim: ReviewSim },
  cascade: { name: "Cascade Simulator", note: "a sample feed", Sim: CascadeSim },
  "values-audit": { name: "Values Audit Simulator", note: "sample conversations", Sim: ValuesSim },
  memory: { name: "Memory Simulator", note: "a sample project", Sim: MemorySim },
};
