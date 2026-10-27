"use client";

import { useEffect, useState } from "react";

// What a post needs from the browser: copying code (a Copy button on every block, and inline
// code copies on click; one listener handles them all) and a thin reading-progress line.
export function ProseTools({ target }: { target: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const article = document.getElementById(target);
    if (!article) return;

    const copy = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    };
    const onClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // A code block: the Copy button above it.
      const button = target.closest<HTMLButtonElement>(".nb-copy");
      const block = button?.parentElement?.querySelector("code");
      if (button && block) {
        const ok = await copy(block.textContent ?? "");
        button.textContent = ok ? "Copied" : "Select and copy";
        button.classList.toggle("is-copied", ok);
        setTimeout(() => {
          button.textContent = "Copy";
          button.classList.remove("is-copied");
        }, 1600);
        return;
      }
      // Inline code copies on click, unless it's a link.
      const inline = target.closest("code");
      if (inline && !inline.closest("pre, a") && (await copy(inline.textContent ?? ""))) {
        inline.classList.add("is-copied");
        setTimeout(() => inline.classList.remove("is-copied"), 1200);
      }
    };
    const onScroll = () => {
      const box = article.getBoundingClientRect();
      const read = (innerHeight * 0.4 - box.top) / box.height;
      setProgress(Math.min(1, Math.max(0, read)));
    };

    article.addEventListener("click", onClick);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      article.removeEventListener("click", onClick);
      removeEventListener("scroll", onScroll);
    };
  }, [target]);

  return <div className="nb-progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />;
}
