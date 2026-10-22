import Link from "next/link";
import { RESUME_READY, nav } from "@/content/site";
import { NavLinks } from "./NavLinks";

// Name top-left → home; ≤ 3 plain-word links top-right (UX-J2, UX-H1). Lead-owned.
export function SiteHeader() {
  const links = [nav.work, nav.contact, ...(RESUME_READY ? [nav.resume] : [])];
  return (
    <header className="site-header">
      <Link href="/" className="site-name">
        {nav.home}
      </Link>
      <nav aria-label="Main">
        <NavLinks links={links} />
      </nav>
    </header>
  );
}
