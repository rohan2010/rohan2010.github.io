"use client";

import { useEffect, useRef } from "react";
import { BufferGeometry, Color, Float32BufferAttribute, PerspectiveCamera, Plane, Points, Raycaster, Scene, ShaderMaterial, Vector2, Vector3, Vector4, WebGLRenderer } from "three";
import { fragment, RIPPLES, vertex } from "./shaders";
import "./dot-terrain.css";

// A hero background: a field of dots on a plane, seen from low down so it runs off to a horizon.
// It rolls slowly at rest. Where the cursor touches the field it lifts a little, and moving it
// drops rings that spread and settle. The copy on top is ordinary DOM; the canvas is decoration.
// It only draws while it's on screen, draws once and stops for reduced motion, and shows a still
// dot pattern in CSS when there's no WebGL.

// The grid: columns across, rows into the distance, and how much ground it covers.
const COLS = 200;
const ROWS = 110;
const WIDTH = 46;
const DEPTH = 40;
// Dot size in world units, and the smallest a far dot can get, in CSS px.
const SIZE = 0.034;
const FLOOR = 1;
// Where dots start fading toward the paper, and where they're gone, in units from the camera.
const NEAR = 9;
const FAR = 34;
// How far the pointer travels on the plane between rings, and the most rings a second.
const RING_STEP = 1.4;
const RING_GAP = 0.12;
// How quickly the eased pointer and hover catch up with the real ones (per second).
const FOLLOW = 7;
// A frame of the swell for the still version, in seconds.
const STILL_AT = 14;

export function DotTerrain() {
  const ref = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current!;
    const holder = glRef.current!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // A fresh canvas each mount: strict mode mounts twice in development, and a canvas whose
    // context was released on the first unmount can't be used again.
    const canvas = document.createElement("canvas");
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      root.dataset.fallback = "";
      return;
    }
    holder.appendChild(canvas);
    renderer.setClearColor(0x000000, 0);

    const scene = new Scene();
    const camera = new PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 1.7, 6);
    camera.lookAt(0, 0.1, -8);

    // The grid, flat on y = 0. Rows are spaced a touch wider than columns: perspective
    // squashes depth, so this keeps the far rows from merging into a band.
    const pos = new Float32Array(COLS * ROWS * 3);
    for (let j = 0; j < ROWS; j++) {
      for (let i = 0; i < COLS; i++) {
        const k = (j * COLS + i) * 3;
        pos[k] = (i / (COLS - 1) - 0.5) * WIDTH;
        pos[k + 2] = 4 - (j / (ROWS - 1)) * DEPTH;
      }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(pos, 3));

    const ripples = Array.from({ length: RIPPLES }, () => new Vector4(0, 0, -99, 0));
    const uniforms = {
      uTime: { value: reduced ? STILL_AT : 0 },
      uScale: { value: 1 },
      uSize: { value: SIZE },
      uFloor: { value: FLOOR },
      uPointer: { value: new Vector2(0, -6) },
      uHover: { value: 0 },
      uRipples: { value: ripples },
      uNear: { value: NEAR },
      uFar: { value: FAR },
      uInk: { value: new Color() },
      uBrass: { value: new Color() },
    };
    const material = new ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, transparent: true, depthWrite: false });
    const points = new Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    // Colours come from the page's tokens, so the field follows the site's colour scheme.
    const read = () => {
      const css = getComputedStyle(root);
      const ink = css.getPropertyValue("--ink").trim();
      const brass = css.getPropertyValue("--signal").trim();
      if (ink) uniforms.uInk.value.setStyle(ink);
      if (brass) uniforms.uBrass.value.setStyle(brass);
    };

    const draw = () => renderer.render(scene, camera);
    let raf = 0;
    let running = false;
    let onScreen = false;
    let last = 0;
    let lastDraw = 0;

    const size = () => {
      const w = root.clientWidth;
      const h = root.clientHeight;
      if (!w || !h) return;
      const dpr = Math.min(devicePixelRatio, 2);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // On a narrow stage, widen the lens so the field still reaches both edges.
      camera.fov = camera.aspect < 1 ? 58 : 42;
      camera.updateProjectionMatrix();
      uniforms.uScale.value = (h * dpr) / (2 * Math.tan((camera.fov * Math.PI) / 360));
      uniforms.uFloor.value = FLOOR * dpr;
      if (reduced || !running) draw();
    };

    // Pointer: real position on the plane, an eased copy for the shader, and rings dropped
    // every RING_STEP units of travel.
    const raycaster = new Raycaster();
    const ground = new Plane(new Vector3(0, 1, 0), 0);
    const ndc = new Vector2();
    const hit = new Vector3();
    const target = new Vector2(0, -6);
    let over = false;
    let lastRing = new Vector2(1e9, 1e9);
    let lastRingAt = -99;
    let nextRing = 0;
    let fresh = true;

    const ring = (x: number, z: number, strength: number) => {
      const t = uniforms.uTime.value;
      if (t - lastRingAt < RING_GAP) return;
      ripples[nextRing].set(x, z, t, strength);
      nextRing = (nextRing + 1) % RIPPLES;
      lastRing = new Vector2(x, z);
      lastRingAt = t;
    };

    // Returns false when the ray misses the plane (pointing above the horizon).
    const project = (e: PointerEvent) => {
      const r = root.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(ground, hit) || hit.z < -DEPTH + 6) return false;
      target.set(hit.x, hit.z);
      return true;
    };

    const move = (e: PointerEvent) => {
      over = project(e);
      if (!over) return;
      // The first point after entering snaps the eased pointer, so the mound doesn't slide in
      // from wherever it was last.
      if (fresh) {
        uniforms.uPointer.value.copy(target);
        fresh = false;
      }
      if (target.distanceTo(lastRing) > RING_STEP) ring(target.x, target.y, 0.8);
    };
    const down = (e: PointerEvent) => {
      if (project(e)) {
        over = true;
        lastRingAt = -99;
        ring(target.x, target.y, 1);
      }
    };
    const leave = () => {
      over = false;
      fresh = true;
    };

    // The loop: on while the stage is on screen and the tab is visible. 30 frames a second
    // when it's only the swell, 60 while the pointer or a ring is doing something.
    const busy = () => over || uniforms.uHover.value > 0.01 || ripples.some((r) => r.w > 0 && uniforms.uTime.value - r.z < 5);
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      uniforms.uTime.value += dt;
      const ease = 1 - Math.exp(-dt * FOLLOW);
      uniforms.uHover.value += ((over ? 1 : 0) - uniforms.uHover.value) * ease;
      uniforms.uPointer.value.lerp(target, ease);
      if (now - lastDraw < (busy() ? 0 : 30)) return;
      lastDraw = now;
      draw();
    };
    const start = () => {
      if (running || reduced || !onScreen || document.hidden) return;
      running = true;
      read();
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    const ro = new ResizeObserver(size);
    const visible = () => (document.hidden ? stop() : start());
    const lost = (e: Event) => {
      e.preventDefault();
      stop();
      root.dataset.fallback = "";
    };

    read();
    size();
    draw();
    io.observe(root);
    ro.observe(root);
    document.addEventListener("visibilitychange", visible);
    canvas.addEventListener("webglcontextlost", lost);
    if (!reduced) {
      root.addEventListener("pointermove", move);
      root.addEventListener("pointerdown", down);
      root.addEventListener("pointerleave", leave);
      root.addEventListener("pointercancel", leave);
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", visible);
      canvas.removeEventListener("webglcontextlost", lost);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointercancel", leave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return (
    <div className="dt" ref={ref}>
      <div className="dt-gl" ref={glRef} aria-hidden="true" />
      <div className="dt-fallback" aria-hidden="true" />
      <div className="dt-scrim" aria-hidden="true" />
      {/* Sample copy for a made-up product. On a real page the headline would be the h1. */}
      <div className="dt-copy">
        <p className="dt-eyebrow">Now in public beta</p>
        <p className="dt-title">
          Release notes your users <em>actually</em> read.
        </p>
        <p className="dt-sub">Write once, and every change reaches the people it affects, in the app and in their inbox.</p>
        <div className="dt-actions">
          <button type="button" className="btn">
            Start writing
          </button>
          <span className="dt-note">Free for small teams</span>
        </div>
      </div>
    </div>
  );
}
