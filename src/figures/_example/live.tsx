"use client";

import * as React from "react";
import { IsoFigure } from "@/components/iso/react/draw";
import { useReadout } from "@/components/iso/react/live";
import { axisVector } from "@/components/iso/iso-kit";
import { useScrub } from "@/lib/motion";
import { feedAt, readoutOf } from "./model";
import { FEED, HEIGHT, P, WIDTH } from "./view";

// The ONE client component of the figure. It reads scroll progress through
// useScrub (from the enclosing <Scene>) and writes a transform on a ref.
// No React state changes per frame. Under reduced motion useScrub calls this
// once with p = 1, so the figure rests at its end state.

const STEP = axisVector(P, [FEED, 0, 0]); // screen vector for a full feed

export function CardFeedLive({ under, card }: { under: React.ReactNode; card: React.ReactNode }) {
  const cardRef = React.useRef<SVGGElement>(null);
  const { anchor, say } = useReadout<SVGGElement>();
  const last = React.useRef("");

  useScrub(
    (progress) => {
      const f = feedAt(progress);
      cardRef.current?.setAttribute("transform", `translate(${(STEP[0] * f).toFixed(2)} ${(STEP[1] * f).toFixed(2)})`);
      const text = readoutOf(progress);
      if (text !== last.current) {
        last.current = text;
        say(text);
      }
    },
    // Pins the whole scene <section> on desktop for 1.5 screens while the card
    // feeds; phones scroll straight through with the same progress.
    { pin: "desktop" },
  );

  return (
    <IsoFigure width={WIDTH} height={HEIGHT} label="Illustrative: a stack of punched cards in a hopper; scrolling feeds the top card out onto the tray.">
      <g ref={anchor}>
        {under}
        <g ref={cardRef}>{card}</g>
      </g>
    </IsoFigure>
  );
}
