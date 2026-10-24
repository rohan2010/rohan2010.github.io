"use client";

import { DESKTOP, MOTION, PHONE, ScrollTrigger, SplitText, gsap, useGSAP } from "@/lib/motion";
import { timeline } from "./data";

// All home-page motion. The markup is complete without this; under reduced
// motion nothing here runs.
export function HomeMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(MOTION, () => {
      // Hero: the headline rises in by word, then the rest follows.
      const title = document.querySelector<HTMLElement>("[data-split]");
      if (title) {
        const split = SplitText.create(title, { type: "words", mask: "words" });
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from(split.words, { yPercent: 110, duration: 1.1, stagger: 0.06 })
          .from(".v3-kicker, .v3-lede, .v3-cta", { y: 24, opacity: 0, duration: 0.9, stagger: 0.1 }, "-=0.8")
          .from(".v3-stats > div", { y: 30, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.7");
      }

      // Stat counters.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count);
        const n = { v: 0 };
        gsap.to(n, {
          v: to,
          duration: 1.8,
          delay: 0.6,
          ease: "power3.out",
          onUpdate: () => (el.textContent = Math.round(n.v).toLocaleString("en-US")),
        });
      });

      // Section headings.
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const split = SplitText.create(el, { type: "lines", mask: "lines" });
        gsap.from(split.lines, {
          yPercent: 105,
          duration: 1,
          stagger: 0.08,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Work cards: stagger in, and a light that follows the cursor.
      gsap.from("[data-card]", {
        y: 60,
        opacity: 0,
        rotateX: -8,
        duration: 1,
        stagger: 0.12,
        ease: "expo.out",
        scrollTrigger: { trigger: ".v3-work", start: "top 80%" },
      });
    });

    // Timeline, desktop: pinned, scrolls sideways; the year ticks and the rail fills.
    mm.add(`${MOTION} and ${DESKTOP}`, () => {
      const section = document.querySelector<HTMLElement>(".v3-tl");
      const track = document.querySelector<HTMLElement>(".v3-tl-track");
      const year = document.querySelector<HTMLElement>(".v3-tl-year");
      const stops = gsap.utils.toArray<HTMLElement>("[data-stop]");
      if (!section || !track || !year) return;

      section.classList.add("is-pinned");
      const distance = () => track.scrollWidth - window.innerWidth + window.innerWidth * 0.12;
      let last = -1;

      const slide = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Fill to the current stop: stop k sits at k/n of the track width.
            const n = stops.length;
            const pad = parseFloat(getComputedStyle(track).paddingLeft);
            track.style.setProperty("--fill", String((pad + (self.progress * (n - 1) * (track.scrollWidth - pad)) / n) / track.scrollWidth));
            const i = Math.min(stops.length - 1, Math.round(self.progress * (stops.length - 1)));
            if (i === last) return;
            last = i;
            stops.forEach((s, k) => s.classList.toggle("is-active", k === i));
            stops.forEach((s, k) => s.classList.toggle("is-past", k < i));
            gsap.fromTo(year, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" });
            year.textContent = timeline[i].year;
          },
        },
      });

      stops.forEach((stop) => {
        gsap.from(stop.querySelectorAll(".v3-stop-when, h3, .v3-stop-where, .v3-stop-text, .v3-stop-stat, .v3-tags"), {
          y: 40,
          opacity: 0,
          stagger: 0.05,
          duration: 0.8,
          ease: "expo.out",
          scrollTrigger: { trigger: stop, containerAnimation: slide, start: "left 85%" },
        });
      });
      stops[0]?.classList.add("is-active");

      return () => section.classList.remove("is-pinned");
    });

    // Timeline, phone: vertical; the rail draws as you scroll.
    mm.add(`${MOTION} and ${PHONE}`, () => {
      gsap.fromTo(
        ".v3-tl-track",
        { "--fill": 0 },
        { "--fill": 1, ease: "none", scrollTrigger: { trigger: ".v3-tl-track", start: "top 70%", end: "bottom 60%", scrub: true } },
      );
      gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((stop) => {
        gsap.from(stop, {
          x: 40,
          opacity: 0,
          duration: 0.9,
          ease: "expo.out",
          scrollTrigger: {
            trigger: stop,
            start: "top 80%",
            onEnter: () => stop.classList.add("is-active"),
            onLeaveBack: () => stop.classList.remove("is-active"),
          },
        });
      });
    });

    // Cursor light on cards (any pointer device; cheap, no reduced-motion concern).
    const cards = gsap.utils.toArray<HTMLElement>("[data-card]");
    const move = (e: PointerEvent) => {
      const el = e.currentTarget as HTMLElement;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    cards.forEach((c) => c.addEventListener("pointermove", move));

    ScrollTrigger.refresh();
    return () => {
      cards.forEach((c) => c.removeEventListener("pointermove", move));
      mm.revert();
    };
  });

  return null;
}
