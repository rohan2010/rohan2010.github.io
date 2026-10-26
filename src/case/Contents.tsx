"use client";

import { useEffect, useState } from "react";
import "./contents.css";

// The case study's contents, pinned beside the text: one hairline rail, the section you're
// reading marked with a bar. Below it, the one ask, where a blog would put "Share".
export type ContentsItem = { id: string; label: string };

export function Contents({ items, links }: { items: ContentsItem[]; links?: { href: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    // The current section is the last one whose heading has passed the top third of the screen.
    const spy = () => {
      const line = innerHeight / 3;
      let current = items[0]?.id;
      for (const { id } of items) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // At the very bottom, the last section is the one being read, however short it is.
      if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) current = items[items.length - 1]?.id;
      setActive(current);
    };
    spy();
    addEventListener("scroll", spy, { passive: true });
    addEventListener("resize", spy);
    return () => {
      removeEventListener("scroll", spy);
      removeEventListener("resize", spy);
    };
  }, [items]);

  return (
    <nav className="contents" aria-label="Contents">
      <p className="contents-head">Contents</p>
      <ol className="contents-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={`#${item.id}`} aria-current={item.id === active ? "location" : undefined}>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
      {links && links.length > 0 && (
        <>
          <p className="contents-head">Get in touch</p>
          <ul className="contents-links">
            {links.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </>
      )}
    </nav>
  );
}
