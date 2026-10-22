import { Ruler } from "@/components/ruler/Ruler";
import { SiteFooter } from "@/components/site/SiteFooter";
import { EMAIL, GITHUB, LINKEDIN, site } from "@/content/site";
import { PageTransition } from "@/lib/transitions";
import { Scenes0to3 } from "@/scenes/s0-s3";
import { Scenes4to5 } from "@/scenes/s4-s5";
import { Scenes6to8 } from "@/scenes/s6-s8";

// The home page: the ruler, then scenes 0–8 in order. Lead-owned: phase-1
// workstreams change their own scenes folder, never this file.

// ProfilePage JSON-LD. Every value is on the page; no telephone.
const PROFILE = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: site.name,
    url: site.url,
    jobTitle: site.role,
    worksFor: { "@type": "Organization", name: "BulkMagic, Inc" },
    alumniOf: [{ "@type": "CollegeOrUniversity", name: "Purdue University" }],
    email: `mailto:${EMAIL}`,
    address: { "@type": "PostalAddress", addressLocality: "Delhi", addressCountry: "IN" },
    sameAs: [LINKEDIN, GITHUB],
  },
};

export default function Home() {
  return (
    <PageTransition>
      <div className="home">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PROFILE).replace(/</g, "\\u003c") }} />
        <Ruler />
        <main id="main" tabIndex={-1}>
          <Scenes0to3 />
          <Scenes4to5 />
          <Scenes6to8 />
        </main>
        <SiteFooter />
      </div>
    </PageTransition>
  );
}
