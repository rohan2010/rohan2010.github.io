"use client";

import * as React from "react";
import { ScrollTrigger } from "@/lib/motion";
import { pos } from "./scale";

// Moves the ruler with the page. No React state: every write is an attribute or
// a style on an element, at most once per frame.
//
// The reading line sits 40% down the viewport. Inside scene i (from its top to
// the next scene's top) the year runs from `year` to `yearTo` and --era from
// the scene's era to the next scene's, linearly in scroll.

interface Mark {
  top: number;
  year: number;
  yearTo: number;
  era: number;
  label: string;
}

const READING_LINE = 0.4;
const clamp = (v: number) => Math.min(1, Math.max(0, v));

export function RulerLive() {
  React.useEffect(() => {
    const root = document.documentElement;
    const ruler = document.querySelector<HTMLElement>("[data-ruler]");
    const track = document.querySelector<HTMLElement>("[data-ruler-track]");
    const pointer = document.querySelector<HTMLElement>("[data-ruler-pointer]");
    const pointerYear = document.querySelector<HTMLElement>("[data-ruler-year]");
    const span = document.querySelector<HTMLElement>("[data-ruler-span]");
    const reels = Array.from(document.querySelectorAll<HTMLElement>("[data-odometer] .odo-reel"));
    const stripLabel = document.querySelector<HTMLElement>("[data-strip-label]");
    const bar = document.querySelector<HTMLElement>("[data-strip-bar]");
    const strip = document.querySelector<HTMLElement>("[data-strip]");
    if (!ruler || !track || !pointer || !pointerYear || !span || !stripLabel || !bar || !strip) return;

    let marks: Mark[] = [];
    let end = 0;
    let trackHeight = 0;
    let shownYear = -1;
    let shownScene = -1;
    let shownEra = "";

    const measure = () => {
      const sections = Array.from(document.querySelectorAll<HTMLElement>("main [data-scene]"));
      marks = sections.map((section) => {
        const box = section.parentElement?.classList.contains("pin-spacer") ? section.parentElement : section;
        const year = Number(section.dataset.year);
        return {
          top: box.getBoundingClientRect().top + window.scrollY,
          year,
          yearTo: section.dataset.yearTo ? Number(section.dataset.yearTo) : year,
          era: Number(section.dataset.era),
          label: section.dataset.yearLabel ?? String(year),
        };
      });
      const last = sections.at(-1);
      const lastBox = last?.parentElement?.classList.contains("pin-spacer") ? last.parentElement : last;
      end = lastBox ? lastBox.getBoundingClientRect().bottom + window.scrollY : 0;
      trackHeight = track.clientHeight;
      shownScene = -1;
      shownYear = -1;
    };

    const update = () => {
      if (!marks.length) return;
      const line = window.scrollY + window.innerHeight * READING_LINE;
      let i = 0;
      while (i + 1 < marks.length && marks[i + 1]!.top <= line) i++;
      const mark = marks[i]!;
      const next = marks[i + 1];
      const t = clamp((line - mark.top) / ((next?.top ?? end) - mark.top || 1));
      const year = mark.year + (mark.yearTo - mark.year) * t;
      const era = mark.era + ((next?.era ?? mark.era) - mark.era) * t;

      const eraText = era.toFixed(3);
      if (eraText !== shownEra) {
        root.style.setProperty("--era", eraText);
        shownEra = eraText;
      }
      pointer.style.transform = `translate3d(0, ${(pos(year) * trackHeight).toFixed(1)}px, 0)`;

      const whole = Math.round(year);
      if (whole !== shownYear) {
        shownYear = whole;
        pointerYear.textContent = String(whole);
        String(whole)
          .padStart(4, "0")
          .split("")
          .forEach((digit, index) => reels[index]?.style.setProperty("--d", digit));
      }
      if (i !== shownScene) {
        shownScene = i;
        const from = pos(Math.min(mark.year, mark.yearTo));
        const to = pos(Math.max(mark.year, mark.yearTo));
        span.style.transform = `translate3d(0, ${(from * trackHeight).toFixed(1)}px, 0)`;
        span.style.height = `${Math.max(2, (to - from) * trackHeight).toFixed(1)}px`;
        // A rhyme shows its span ("1989 ↔ 2021"); a single year is already on the odometer.
        stripLabel.textContent = mark.yearTo !== mark.year ? mark.label : "";
        ruler.dataset.scene = String(i);
      }
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${clamp(max > 0 ? window.scrollY / max : 0).toFixed(4)})`;
    };

    const onRefresh = () => {
      measure();
      update();
    };
    ScrollTrigger.addEventListener("refresh", onRefresh);
    root.setAttribute("data-era-live", "");
    ruler.setAttribute("data-live", "");
    strip.setAttribute("data-live", "");
    onRefresh();
    // Lenis writes the native scroll position, so one listener serves both modes.
    window.addEventListener("scroll", update, { passive: true });

    return () => {
      ScrollTrigger.removeEventListener("refresh", onRefresh);
      window.removeEventListener("scroll", update);
      root.removeAttribute("data-era-live");
      root.style.removeProperty("--era");
      ruler.removeAttribute("data-live");
      strip.removeAttribute("data-live");
    };
  }, []);

  return null;
}
