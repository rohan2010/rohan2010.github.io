"use client";

import * as React from "react";
import type { Chapter } from "@/content/story";

// Marks the chapter the reader is in: `aria-current` on its rail link, and
// `data-read` on the ones already passed. One IntersectionObserver on a thin
// band across the middle of the viewport; no scroll listeners. Also lets
// Escape close the phone menu and hand focus back to its summary.
export function ChapterRail({ chapters }: { chapters: Chapter[] }) {
  React.useEffect(() => {
    const ids = ["top", ...chapters.map((chapter) => chapter.id), "contact"];
    const sections = ids.map((id) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const marks = Array.from(document.querySelectorAll<HTMLElement>(".topbar [data-ch]"));
    const now = document.querySelector<HTMLElement>(".rail-now");
    const mark = (current: string) => {
      const at = ids.indexOf(current);
      for (const node of marks) {
        const index = ids.indexOf(node.dataset.ch!);
        if (index === at) node.setAttribute(node.tagName === "A" ? "aria-current" : "data-current", "true");
        else node.removeAttribute(node.tagName === "A" ? "aria-current" : "data-current");
        if (index < at) node.dataset.read = "";
        else delete node.dataset.read;
      }
      const chapter = chapters.find((item) => item.id === current);
      if (now) now.textContent = chapter ? `${chapter.n} ${chapter.word} · ${chapter.years}` : "";
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) mark(entry.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    sections.forEach((section) => observer.observe(section));

    const menu = document.querySelector<HTMLDetailsElement>(".topbar-menu");
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !menu?.open) return;
      menu.open = false;
      menu.querySelector<HTMLElement>("summary")?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      observer.disconnect();
      document.removeEventListener("keydown", onKey);
    };
  }, [chapters]);
  return null;
}
