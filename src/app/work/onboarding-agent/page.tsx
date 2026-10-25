import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/content/projects";
import { Design } from "@/os/Design";
import { Zones } from "@/sheet/Zones";
import { Toy } from "@/toy/Toy";
import "@/sheet/sheet.css";

// Case study: the day-job onboarding agent, as sheet 3 of the drawing set.
// The employer is never named. Every claim comes from the résumé; nothing internal.

export const metadata: Metadata = {
  title: "A seller onboarding agent · Rohan Pant",
  description: "An agent that checks a new seller's KYC, tax and legal documents and retries when a check fails. Seller activation went from days to minutes.",
};

export default function OnboardingAgent() {
  const project = getProjects().find((p) => p.slug === "onboarding-agent");
  return (
    <main className="sheets">
      <section className="sheet sheet-case" aria-labelledby="case-title">
        <Zones />
        <div className="case-grid">
          <article className="case-text">
            <p className="case-back">
              <Link href="/">Back to the desk</Link>
            </p>
            <h1 id="case-title">A seller onboarding agent</h1>
            <p className="case-lede">
              New sellers used to wait days to go live while their documents got checked. Now an agent checks them, and it takes minutes.
            </p>

            <h2>The problem</h2>
            <p>
              Before a seller can sell, someone has to check their KYC, tax and legal documents. Every document is a little different, some are photos
              taken on a phone, and some are simply wrong. That check was the slow part of getting a seller live.
            </p>

            <h2>What I built</h2>
            <p>
              A stateful agent workflow in LangGraph. Each step is a node that calls a tool: read the document, validate a field, look something up.
              The graph routes on what each node finds, so a clean document goes straight through and a messy one takes a detour.
            </p>
            <p>When a check fails, the workflow doesn’t give up and doesn’t guess. It retries, and conditional routing decides where the document goes next.</p>

            <h2>Keeping it honest</h2>
            <p>A model that’s confidently wrong is worse than a slow human. Across the platform’s AI features, I kept generation reliable in production:</p>
            <ul>
              <li>Model output is checked against a schema before anything uses it.</li>
              <li>Malformed output gets a retry, then a fallback path, never a crash.</li>
              <li>Every prompt change is regression-tested against a curated eval set before it ships.</li>
            </ul>

            <h2>Around it</h2>
            <p>
              The agent sits inside a bigger platform I also worked on. A multimodal generation service (OpenAI for product copy, Stable Diffusion for
              images) cut product listing time by 40%. The multi-seller storefront itself (Next.js, Tailwind, REST APIs) got stores to market 30% faster,
              with CI/CD in GitHub Actions that halved deployment cycles at zero downtime.
            </p>
          </article>

          <aside className="title-block case-block" aria-label="Project facts">
            <div className="tb-cell tb-name">
              <span className="tb-label">Part</span>
              <p className="case-part">Seller onboarding agent</p>
            </div>
            <div className="tb-cell tb-title">
              <span className="tb-label">Result</span>
              <p>Seller activation: days to minutes</p>
            </div>
            <div className="tb-cell tb-left">
              <span className="tb-label">Where</span>
              <p>My day job</p>
            </div>
            <div className="tb-cell">
              <span className="tb-label">When</span>
              <p>2024 – now</p>
            </div>
            <div className="tb-cell tb-line">
              <span className="tb-label">Built with</span>
              <p>LangGraph, tool calling, schema guardrails, an eval set</p>
            </div>
            <div className="tb-cell tb-line">
              <span className="tb-label">My part</span>
              <p>Built the agent workflow</p>
            </div>
            <div className="tb-cell tb-line">
              <span className="tb-label">Note</span>
              <p>Work for an employer: the code, data and internal details stay private.</p>
            </div>
            <div className="tb-cell tb-left">
              <span className="tb-label">Drawn by</span>
              <p>Rohan Pant</p>
            </div>
            <div className="tb-cell">
              <span className="tb-label">Sheet</span>
              <p>3 of 3</p>
            </div>
          </aside>
        </div>

        <section className="detail" aria-labelledby="detail-a">
          <h2 id="detail-a" className="detail-title">
            Detail A: try a toy version
          </h2>
          <p className="detail-note">
            The documents are made up, but it checks, fails, retries and routes the way the real one does. The step where it asks you is borrowed from an
            earlier project of mine, where the least confident 15% of a model’s answers went to a person.
          </p>
          <div className="detail-body">
            <Toy />
          </div>
        </section>

        {project?.design && (
          <section className="detail" aria-labelledby="detail-b">
            <h2 id="detail-b" className="detail-title">
              Detail B: how a document moves through it
            </h2>
            <div className="detail-body detail-scroll">
              <Design nodes={project.design.nodes} edges={project.design.edges} />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
