import { Mesh, OrthographicCamera, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, Vector4, WebGLRenderer } from "three";
import { FRAG, VERT } from "./shader";

// Runs the living paper on a stage: makes its own canvas, reads the site's colours off the stage,
// draws only while the stage is on screen, and takes it all down again. Returns the cleanup.
// `naive` runs the same shader the obvious way, for the comparison tab.

// Share of device pixels the shader draws; CSS scales the canvas up. The page is soft, so
// nobody sees the difference, and the GPU does about a third of the work.
const SCALE = 0.6;
const MAX_DPR = 2;
// The page barely moves, so 30 frames a second is plenty.
const FPS = 30;
// Seconds for one full breath. The shader only ever sees the phase, which loops cleanly.
const LOOP = 140;
// How quickly the lens follows the pointer, and how quickly it fades in and out, per second.
const FOLLOW = 3;
const FADE = 1.6;
// Padding around the copy block that the shader keeps calm, as a share of the stage height.
const PAD = 0.05;
const TOKENS = ["--paper", "--paper-2", "--ink", "--brand", "--signal"] as const;

export function mountPaper(stage: HTMLElement, holder: HTMLElement, copy: HTMLElement, naive = false): () => void {
  // A fresh canvas each mount. Strict mode mounts twice, and a canvas whose context was
  // released on the first cleanup would come back dead on the second.
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2", { antialias: false, alpha: false, depth: false, powerPreference: "low-power" });
  // No WebGL: the stage keeps its CSS gradients and the copy works as it is.
  if (!gl) return () => {};
  holder.appendChild(canvas);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new WebGLRenderer({ canvas, context: gl });
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const uniforms = {
    uRes: { value: new Vector2(1, 1) },
    uPhase: { value: 0 },
    uTime: { value: 0 },
    uGrain: { value: 0 },
    uPointer: { value: new Vector2(0, 0) },
    uLens: { value: 0 },
    uCopy: { value: new Vector4(0, 0, 0.4, 0.2) },
    uPaper: { value: new Vector3() },
    uPaper2: { value: new Vector3() },
    uInk: { value: new Vector3() },
    uBrand: { value: new Vector3() },
    uSignal: { value: new Vector3() },
    uDark: { value: 0 },
  };
  const material = new ShaderMaterial({
    vertexShader: VERT,
    fragmentShader: FRAG,
    uniforms,
    defines: naive ? { OCTAVES: 6, NAIVE: "" } : { OCTAVES: 3 },
    depthTest: false,
    depthWrite: false,
  });
  scene.add(new Mesh(geometry, material));

  // Colours: whatever the tokens hold (hex, rgb, oklch), resolved by a 2D canvas to sRGB bytes,
  // then to linear light, which is what mixing should happen in.
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const linear = (value: string): [number, number, number] => {
    probe.clearRect(0, 0, 1, 1);
    probe.fillStyle = "#000";
    probe.fillStyle = value || "#000";
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    return [toLinear(r / 255), toLinear(g / 255), toLinear(b / 255)];
  };
  const readColours = () => {
    const css = getComputedStyle(stage);
    const [paper, paper2, ink, brand, signal] = TOKENS.map((t) => linear(css.getPropertyValue(t).trim()));
    uniforms.uPaper.value.set(...paper);
    uniforms.uPaper2.value.set(...paper2);
    uniforms.uInk.value.set(...ink);
    uniforms.uBrand.value.set(...brand);
    uniforms.uSignal.value.set(...signal);
    const lum = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
    uniforms.uDark.value = lum(paper) < lum(ink) ? 1 : 0;
  };

  // Size: the canvas fills the stage in CSS; its buffer is the stage at a capped, reduced
  // density. The shader gets the buffer size, and works out the aspect from it.
  let w = 1;
  let h = 1;
  const size = () => {
    const r = stage.getBoundingClientRect();
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    renderer.setPixelRatio(naive ? devicePixelRatio : Math.min(devicePixelRatio, MAX_DPR) * SCALE);
    renderer.setSize(w, h, false);
    renderer.getDrawingBufferSize(uniforms.uRes.value);
    // Where the copy sits, in the shader's height-normalised space (y up, centre at 0).
    const c = copy.getBoundingClientRect();
    uniforms.uCopy.value.set(((c.left + c.width / 2 - r.left) / w - 0.5) * (w / h), 0.5 - (c.top + c.height / 2 - r.top) / h, c.width / 2 / h + PAD, c.height / 2 / h + PAD);
  };

  // The pointer, eased toward its target; `inside` says whether the lens should show.
  const target = new Vector2();
  let inside = false;
  const toStage = (e: PointerEvent) => {
    const r = stage.getBoundingClientRect();
    target.set(((e.clientX - r.left) / w - 0.5) * (w / h), 0.5 - (e.clientY - r.top) / h);
    // If the lens had faded, start it where the pointer is rather than sliding over from where
    // it was last.
    if (uniforms.uLens.value < 0.02) uniforms.uPointer.value.copy(target);
    inside = true;
  };
  const leave = (e: PointerEvent) => {
    if (e.type === "pointerup" && e.pointerType === "mouse") return;
    inside = false;
  };

  const start = performance.now();
  const draw = (now: number, dt: number) => {
    const t = (now - start) / 1000;
    uniforms.uPhase.value = ((t % LOOP) / LOOP) * Math.PI * 2;
    uniforms.uTime.value = t;
    uniforms.uGrain.value = Math.random();
    const p = uniforms.uPointer.value;
    if (naive) {
      p.copy(target);
      uniforms.uLens.value = inside ? 1 : 0;
    } else {
      p.lerp(target, 1 - Math.exp(-FOLLOW * dt));
      uniforms.uLens.value += ((inside ? 1 : 0) - uniforms.uLens.value) * (1 - Math.exp(-FADE * dt));
    }
    renderer.render(scene, camera);
    stage.classList.add("is-live");
  };

  // The loop runs only while the stage is on screen and the tab is visible.
  let raf = 0;
  let last = 0;
  let onScreen = false;
  const frame = (now: number) => {
    raf = 0;
    if (!onScreen || document.hidden) return;
    raf = requestAnimationFrame(frame);
    if (!naive && now - last < 1000 / FPS - 2) return;
    const dt = Math.min(0.1, (now - (last || now)) / 1000);
    last = now;
    draw(now, dt);
  };
  const wake = () => {
    if (reduced) return;
    if (!raf && onScreen && !document.hidden) {
      last = 0;
      raf = requestAnimationFrame(frame);
    }
  };
  // Reduced motion, or a resize while parked: one still frame.
  const still = () => {
    if (!raf) draw(performance.now(), 0);
  };

  readColours();
  size();
  still();

  const io = new IntersectionObserver(
    ([e]) => {
      onScreen = e.isIntersecting;
      wake();
    },
    { rootMargin: "120px" },
  );
  io.observe(stage);
  const ro = new ResizeObserver(() => {
    size();
    still();
  });
  ro.observe(stage);
  ro.observe(copy);
  // The site's colour scheme can change under the page; follow it.
  const mo = new MutationObserver(() => {
    readColours();
    still();
  });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scheme", "class", "style"] });
  document.addEventListener("visibilitychange", wake);
  const lost = (e: Event) => {
    e.preventDefault();
    stage.classList.remove("is-live");
  };
  const restored = () => still();
  canvas.addEventListener("webglcontextlost", lost);
  canvas.addEventListener("webglcontextrestored", restored);
  if (!reduced) {
    stage.addEventListener("pointermove", toStage, { passive: true });
    stage.addEventListener("pointerdown", toStage, { passive: true });
    stage.addEventListener("pointerleave", leave);
    stage.addEventListener("pointercancel", leave);
    stage.addEventListener("pointerup", leave);
  }

  return () => {
    cancelAnimationFrame(raf);
    raf = 0;
    io.disconnect();
    ro.disconnect();
    mo.disconnect();
    document.removeEventListener("visibilitychange", wake);
    canvas.removeEventListener("webglcontextlost", lost);
    canvas.removeEventListener("webglcontextrestored", restored);
    stage.removeEventListener("pointermove", toStage);
    stage.removeEventListener("pointerdown", toStage);
    stage.removeEventListener("pointerleave", leave);
    stage.removeEventListener("pointercancel", leave);
    stage.removeEventListener("pointerup", leave);
    stage.classList.remove("is-live");
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    // Hand the context back now, not whenever the garbage collector gets to it: browsers allow
    // only a handful at once, and the Playground index runs several.
    renderer.forceContextLoss();
    canvas.remove();
  };
}
