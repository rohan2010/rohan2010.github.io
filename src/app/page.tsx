import { Contact } from "@/components/sections/Contact";
import { Field } from "@/components/sections/Field";
import { Fun } from "@/components/sections/Fun";
import { Hero } from "@/components/sections/Hero";
import { Research } from "@/components/sections/Research";
import { Work } from "@/components/sections/Work";
import { BenchDetail } from "@/components/figures/bench/detail";
import { DETAILS } from "@/components/figures/bench/details";
import { BenchFigure, BenchLegend } from "@/components/figures/bench/figure";
import { EMAIL, GITHUB, LINKEDIN, chapters, site } from "@/content/story";
import { ChapterRail } from "@/components/ui/ChapterRail";
import { Reveal } from "@/components/ui/Reveal";
import { TopBar } from "@/components/ui/TopBar";

// ProfilePage JSON-LD (design pass, 9.4). Every value here is on the page; no telephone.
const PROFILE = {
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  mainEntity: {
    "@type": "Person",
    name: site.name,
    url: site.url,
    jobTitle: "Software Engineer",
    worksFor: { "@type": "Organization", name: "BulkMagic, Inc" },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Purdue University" },
      { "@type": "CollegeOrUniversity", name: "Maharaja Agrasen Institute of Technology" },
    ],
    email: `mailto:${EMAIL}`,
    address: { "@type": "PostalAddress", addressLocality: "Delhi", addressCountry: "IN" },
    sameAs: [LINKEDIN, GITHUB],
    knowsAbout: ["LLM agent workflows", "RAG pipelines", "LLM evals", "guardrails", "Next.js", "Python"],
  },
};

export default function Home() {
  return (
    <>
      <TopBar />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(PROFILE).replace(/</g, "\\u003c") }} />
      <main id="main" tabIndex={-1}>
        <Hero figure={<BenchFigure />} legend={<BenchLegend />} />
        <Field figure={<BenchDetail spec={DETAILS.field} />} />
        <Research figure={<BenchDetail spec={DETAILS.research} />} />
        <Work figure={<BenchDetail spec={DETAILS.work} />} />
        <Fun figure={<BenchDetail spec={DETAILS.fun} />} />
        <Contact />
      </main>
      <Reveal />
      <ChapterRail chapters={chapters} />
    </>
  );
}
