"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { CARDS, type Card } from "./cards";
import "./spotlight.css";

// The obvious version, kept to compare: each card has its own mousemove listener that puts the
// pointer in React state, so every move re-renders the card (the counter above the grid counts
// them), and getBoundingClientRect runs on every event. The glow is a big box-shadow halo that
// can't light just the part of the border near the pointer, and the tilt is set straight from
// the event on the tilted rect, so it snaps and jitters. Light only reaches the card you're on:
// crossing a gap switches it off and on.

function NaiveCard({ card, onRender }: { card: Card; onRender: () => void }) {
  const [p, setP] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Count every render of every card.
  useEffect(() => onRender());

  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setP({ x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height });
  };
  const style = p && {
    background: `radial-gradient(260px circle at ${p.x}px ${p.y}px, color-mix(in oklab, var(--sc-brass) 22%, transparent), transparent 70%), var(--sc-face)`,
    boxShadow: "0 0 0 1px var(--sc-brass), 0 0 48px 6px color-mix(in oklab, var(--sc-brass) 55%, transparent)",
    transform: `perspective(700px) rotateX(${(0.5 - p.y / p.h) * 14}deg) rotateY(${(p.x / p.w - 0.5) * 14}deg)`,
  };
  return (
    <a href={`#${card.id}`} className={`sc-card sc-${card.size}`} style={style ?? undefined} onMouseMove={move} onMouseLeave={() => setP(null)} onClick={(e) => e.preventDefault()}>
      {card.art}
      <span className="sc-text">
        <span className="sc-title">{card.title}</span>
        <span className="sc-copy">{card.copy}</span>
      </span>
    </a>
  );
}

export function Naive() {
  const renders = useRef<HTMLElement>(null);
  // Written straight to the counter, so counting doesn't add renders of its own.
  const bump = () => {
    const el = renders.current;
    if (el) el.textContent = String(Number(el.textContent) + 1);
  };
  return (
    <section className="sc" aria-labelledby="sc-naive-title">
      <header className="sc-head">
        <p className="sc-kicker">Features</p>
        <h2 id="sc-naive-title">
          Everything in one <em>quiet</em> place
        </h2>
        <p className="sc-sub">
          React renders so far: <b ref={renders}>0</b>. Move across the cards and watch it climb.
        </p>
      </header>
      <div className="sc-grid sc-naive">
        {CARDS.map((c) => (
          <NaiveCard key={c.id} card={c} onRender={bump} />
        ))}
      </div>
    </section>
  );
}
