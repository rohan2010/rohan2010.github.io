"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mark } from "./Mark";

const SECTIONS = [
  ["/#work", "Work"],
  ["/#route", "Background"],
  ["/#os", "rohanOS"],
] as const;

// The bar across the top: the mark and name home, three places to go, one ask. Clear over
// the hero; once the page moves it takes paper and a hairline so it reads over the desk.
export function SiteNav({ mail }: { mail: string }) {
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    const check = () => setMoved(scrollY > 8);
    check();
    addEventListener("scroll", check, { passive: true });
    return () => removeEventListener("scroll", check);
  }, []);

  return (
    <header className={moved ? "nav is-moved" : "nav"}>
      <nav className="nav-in" aria-label="Main">
        <Link className="nav-home" href="/" aria-label="Rohan Pant, home">
          <Mark />
          <span className="nav-name">Rohan Pant</span>
        </Link>
        <ul className="nav-links">
          {/* Plain links on purpose: rohanOS opens on the browser's hashchange, which <Link> never fires. */}
          {SECTIONS.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <a className="nav-cta" href={mail}>
          Email me
        </a>
      </nav>
    </header>
  );
}
