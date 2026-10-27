"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import "./brass-ring.css";

// A hero with one polished object in it: a thick brass ring beside a headline. The ring is
// three.js; the words are ordinary DOM. Its reflections come from a room built in code and
// prefiltered by PMREM, so there's no HDR file to download. It turns slowly, leans toward the
// cursor, and turns a little further as the stage scrolls through the viewport. It only renders
// while on screen, holds one still frame for reduced motion, and falls back to a CSS ring when
// there's no WebGL. The brass and the shadow take their colours from the site's tokens.

// The ring: radius to the middle of the tube, and the tube's radius.
const RING = 1;
const TUBE = 0.36;
// The sphere the camera keeps in frame, centred a little below the ring to take in its shadow.
const FRAME_R = 1.62;
const FRAME_Y = -0.18;
const FOV = 30;
// Where the paper sits, under the ring.
const GROUND_Y = -1.72;
// At rest the ring leans back a little, so it reads as a ring and not a coin.
const REST_TILT = 0.38;
// Idle spin in radians a second, and how far the ring turns across one pass of the stage.
const SPIN = 0.32;
const SCROLL_TURN = Math.PI * 0.9;
// How far it leans toward the pointer, in radians, at the stage's edge.
const LEAN_X = 0.32;
const LEAN_Y = 0.5;
// Damping rates, per second: higher catches up faster.
const EASE_POINTER = 4;
const EASE_SCROLL = 6;
// The angle the still frame (reduced motion) is drawn at.
const STILL_SPIN = 0.62;

// A token's colour as THREE.Color. A probe element resolves var() and color-mix() for us; the
// browser hands back rgb() or color(srgb …), both parsed here.
function tokenColor(root: HTMLElement, token: string, fallback: THREE.Color) {
  const probe = document.createElement("span");
  probe.style.cssText = `position:absolute;visibility:hidden;color:var(${token})`;
  root.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  const n = value.match(/[\d.]+/g)?.map(Number);
  if (!n || n.length < 3) return fallback.clone();
  const scale = value.startsWith("color(") ? 1 : 255;
  return new THREE.Color().setRGB(n[0] / scale, n[1] / scale, n[2] / scale, THREE.SRGBColorSpace);
}

export function BrassRing() {
  const rootRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current!;
    const box = objectRef.current!;
    // The canvas is made here, not in JSX: strict mode mounts twice, and a canvas whose context
    // was released can't give the second mount a new one.
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    box.appendChild(canvas);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      // No WebGL: swap in the CSS ring on the next frame (not during this effect).
      canvas.remove();
      const id = requestAnimationFrame(() => setFailed(true));
      return () => cancelAnimationFrame(id);
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 50);

    // Reflections: a room made of boxes and lights, blurred into an environment map once.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    room.dispose();
    pmrem.dispose();
    scene.environment = env.texture;

    const geometry = new THREE.TorusGeometry(RING, TUBE, 64, 192);
    const material = new THREE.MeshPhysicalMaterial({
      metalness: 1,
      roughness: 0.2,
      clearcoat: 0.5,
      clearcoatRoughness: 0.12,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.castShadow = true;
    // The lean lives on the group; the spin on the ring inside it.
    const group = new THREE.Group();
    group.add(ring);
    scene.add(group);

    // The paper: invisible except for the shadow that falls on it.
    const groundGeometry = new THREE.PlaneGeometry(14, 14);
    const groundMaterial = new THREE.ShadowMaterial({ opacity: 0.2 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = GROUND_Y;
    ground.receiveShadow = true;
    scene.add(ground);

    // One soft light from above casts the shadow and adds a highlight; the room does the rest.
    const sun = new THREE.DirectionalLight(0xffffff, 1.1);
    sun.position.set(1.6, 6, 2.4);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.radius = 10;
    sun.shadow.bias = -0.0005;
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -3;
    sc.right = sc.top = 3;
    sc.near = 1;
    sc.far = 12;
    scene.add(sun);

    // Brass from --signal, lifted a touch toward the paper so the metal isn't muddy; the
    // shadow in --ink. Read again if the colour scheme changes.
    const paint = () => {
      const signal = tokenColor(root, "--signal", new THREE.Color(0.6, 0.42, 0.12));
      const paper = tokenColor(root, "--paper", new THREE.Color(1, 1, 1));
      material.color.copy(signal.lerp(paper, 0.14));
      groundMaterial.color.copy(tokenColor(root, "--ink", new THREE.Color(0, 0, 0)));
    };
    paint();

    // Fit the framing sphere inside whichever of the two angles is tighter, so the ring stays
    // whole in a tall phone cell and a wide desktop one alike.
    const size = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      const v = THREE.MathUtils.degToRad(FOV) / 2;
      const hz = Math.atan(Math.tan(v) * camera.aspect);
      const dist = (FRAME_R / Math.sin(Math.min(v, hz))) * 1.04;
      camera.position.set(0, FRAME_Y + dist * 0.16, dist);
      camera.lookAt(0, FRAME_Y, 0);
      camera.updateProjectionMatrix();
    };

    // Motion state: targets set by input, values eased toward them each frame.
    let spin = reduced ? STILL_SPIN : 0;
    let leanX = 0;
    let leanY = 0;
    let toLeanX = 0;
    let toLeanY = 0;
    let turn = 0;
    let toTurn = 0;

    // How far the stage has travelled through the viewport: 0 as its top enters at the bottom,
    // 1 as its bottom leaves at the top. Measured from the stage, not the page.
    const progress = () => {
      const r = root.getBoundingClientRect();
      const p = (innerHeight - r.top) / (innerHeight + r.height);
      return Math.min(1, Math.max(0, p));
    };

    const pose = () => {
      group.rotation.set(REST_TILT + leanX, leanY, 0);
      ring.rotation.set(turn * 0.25, spin + turn, 0);
    };
    const render = () => {
      pose();
      renderer.render(scene, camera);
    };

    let raf = 0;
    let last = 0;
    let onScreen = false;
    const tick = (now: number) => {
      raf = 0;
      // Clamp the step, so coming back from another tab doesn't jump.
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      toTurn = progress() * SCROLL_TURN;
      // Frame-rate independent lerp: the same feel at 60 Hz and 120 Hz.
      const kp = 1 - Math.exp(-EASE_POINTER * dt);
      const ks = 1 - Math.exp(-EASE_SCROLL * dt);
      leanX += (toLeanX - leanX) * kp;
      leanY += (toLeanY - leanY) * kp;
      turn += (toTurn - turn) * ks;
      spin += SPIN * dt;
      render();
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (reduced || raf || !onScreen || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // Lean toward the pointer, measured from the object's centre across the whole stage.
    const point = (e: PointerEvent) => {
      const s = root.getBoundingClientRect();
      const o = box.getBoundingClientRect();
      const nx = (e.clientX - (o.left + o.width / 2)) / (s.width / 2);
      const ny = (e.clientY - (o.top + o.height / 2)) / (s.height / 2);
      toLeanY = Math.max(-1, Math.min(1, nx)) * LEAN_Y;
      toLeanX = Math.max(-1, Math.min(1, ny)) * LEAN_X;
    };
    const rest = () => {
      toLeanX = 0;
      toLeanY = 0;
    };
    // A finger lifting or handing over to a scroll counts as leaving.
    const lift = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") rest();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        if (onScreen) start();
        else stop();
      },
      { rootMargin: "80px 0px" },
    );
    const ro = new ResizeObserver(() => {
      size();
      if (!raf) render();
    });
    const visibility = () => {
      if (document.hidden) stop();
      else start();
    };
    // A colour scheme switch sets an attribute on <html>; repaint to match.
    const mo = new MutationObserver(() => {
      paint();
      if (!raf) render();
    });
    const lost = (e: Event) => {
      e.preventDefault();
      stop();
      setFailed(true);
    };

    size();
    render();
    ro.observe(box);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-scheme", "class", "style"] });
    canvas.addEventListener("webglcontextlost", lost);
    if (!reduced) {
      io.observe(root);
      document.addEventListener("visibilitychange", visibility);
      root.addEventListener("pointermove", point);
      root.addEventListener("pointerdown", point);
      root.addEventListener("pointerleave", rest);
      root.addEventListener("pointerup", lift);
      root.addEventListener("pointercancel", lift);
    }

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      root.removeEventListener("pointermove", point);
      root.removeEventListener("pointerdown", point);
      root.removeEventListener("pointerleave", rest);
      root.removeEventListener("pointerup", lift);
      root.removeEventListener("pointercancel", lift);
      canvas.removeEventListener("webglcontextlost", lost);
      // Strict mode mounts twice in development: free everything, the context included.
      geometry.dispose();
      material.dispose();
      groundGeometry.dispose();
      groundMaterial.dispose();
      sun.shadow.dispose();
      env.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return (
    <div className="br" ref={rootRef}>
      <div className="br-stage">
        {/* Sample copy. On a real page the headline is the h1. */}
        <div className="br-copy">
          <p className="br-eyebrow">Fittings, made in small batches</p>
          <p className="br-title">
            Made to be <em>handled</em>, not just used.
          </p>
          <p className="br-sub">Solid brass hardware, turned and polished by hand, for doors you open every day.</p>
          <button type="button" className="br-button">
            See the range
          </button>
        </div>
        <div className="br-object" ref={objectRef}>
          {failed && <div className="br-fallback" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}
