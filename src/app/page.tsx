import { EMAIL, GITHUB, LINKEDIN, site } from "@/content/site";
import { Home as HomePage } from "@/home/Home";

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
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PROFILE).replace(/</g, "\\u003c") }} />
      <HomePage />
    </>
  );
}
