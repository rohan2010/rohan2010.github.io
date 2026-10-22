"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks({ links }: { links: { label: string; href: string }[] }) {
  const pathname = usePathname();
  return (
    <ul>
      {links.map((link) => {
        const current = link.href.endsWith("/") && !link.href.includes("#") && pathname.startsWith(link.href);
        const plain = link.href.endsWith(".pdf");
        return (
          <li key={link.href}>
            {plain ? (
              <a href={link.href}>{link.label}</a>
            ) : (
              <Link href={link.href} aria-current={current ? "page" : undefined}>
                {link.label}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
