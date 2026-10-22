// Public motion API. Client components import from "@/lib/motion" only.
// Server components must not import this module (it pulls in GSAP).
export { gsap, ScrollTrigger, SplitText, useGSAP, REDUCE, MOTION, PHONE, DESKTOP } from "./gsap";
export { getLenis, scrollTo, type ScrollToOptions } from "./lenis";
export { useReducedMotion, useScene, useScrub, type ScrubOptions } from "./hooks";
export type { SceneContextValue } from "./scene-context";
