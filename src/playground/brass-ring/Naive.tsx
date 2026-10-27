"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./brass-ring.css";

// The obvious version, for comparison: the same ring and copy, lit the way most first tries
// are. A standard material set to metal, one directional light and an ambient light, no
// environment, no tone mapping, no shadow. Metal only shows what it reflects, and here there's
// nothing to reflect, so the brass goes dark with one hard highlight. It still stops off screen
// and cleans up after itself, so it doesn't cost the page anything while you compare.

export function Naive() {
  const rootRef = useRef<HTMLDivElement>(null);
  const objectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current!;
    const box = objectRef.current!;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    box.appendChild(canvas);
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      canvas.remove();
      return;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
    camera.position.set(0, 0, 4.6);

    const css = getComputedStyle(root);
    const geometry = new THREE.TorusGeometry(1, 0.36, 32, 96);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color(css.getPropertyValue("--signal").trim() || "gray"),
      metalness: 1,
      roughness: 0.3,
    });
    const ring = new THREE.Mesh(geometry, material);
    ring.rotation.x = 0.38;
    scene.add(ring);
    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(2, 3, 4);
    scene.add(light, new THREE.AmbientLight(0xffffff, 0.6));

    const size = () => {
      const w = box.clientWidth;
      const h = box.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const tick = () => {
      ring.rotation.y += 0.01;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      raf = 0;
      if (entry.isIntersecting && !reduced) raf = requestAnimationFrame(tick);
    });
    const ro = new ResizeObserver(() => {
      size();
      renderer.render(scene, camera);
    });
    size();
    renderer.render(scene, camera);
    io.observe(root);
    ro.observe(box);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    };
  }, []);

  return (
    <div className="br" ref={rootRef}>
      <div className="br-stage">
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
        <div className="br-object" ref={objectRef} />
      </div>
    </div>
  );
}
