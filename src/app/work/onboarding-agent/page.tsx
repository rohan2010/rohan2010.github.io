import type { Metadata } from "next";
import { Toy } from "@/toy/Toy";
import "./case.css";

// Case study: the day-job onboarding agent. The employer is never named.
// Every claim comes from docs/RP_resume_developer.pdf; nothing internal.

export const metadata: Metadata = {
  title: "A seller onboarding agent · Rohan Pant",
  description: "An agent that checks a new seller's KYC, tax and legal documents and retries when a check fails. Seller activation went from days to minutes.",
};

export default function OnboardingAgent() {
  return (
    <main className="case">
      <p className="case-meta">Day job · multi-seller e-commerce platform · Aug 2024 – now</p>
      <h1>A seller onboarding agent</h1>
      <p className="case-lede">
        New sellers used to wait days to go live while their documents got checked. Now an agent checks them, and it takes
        minutes.
      </p>

      <dl className="case-facts">
        <div>
          <dt>Seller activation</dt>
          <dd>days → minutes</dd>
        </div>
        <div>
          <dt>Built with</dt>
          <dd>LangGraph, tool calling, an eval set</dd>
        </div>
        <div>
          <dt>My part</dt>
          <dd>Built the agent workflow</dd>
        </div>
      </dl>

      <section>
        <h2>The problem</h2>
        <p>
          Before a seller can sell, someone has to check their KYC, tax and legal documents. Every document is a little
          different, some are photos taken on a phone, and some are simply wrong. That check was the slow part of
          getting a seller live.
        </p>
      </section>

      <section>
        <h2>Try it first</h2>
        <p>
          This is a toy version. The documents are made up, but it checks, fails, retries and routes the way the real
          one does. The step where it asks you is borrowed from an earlier project of mine, where the least confident
          15% of a model’s answers went to a person.
        </p>
        <div className="case-toy">
          <Toy />
        </div>
      </section>

      <section>
        <h2>What I built</h2>
        <p>
          A stateful agent workflow in LangGraph. Each step is a node that calls a tool: read the document, validate a
          field, look something up. The graph routes on what each node finds, so a clean document goes straight
          through and a messy one takes a detour.
        </p>
        <p>
          When a check fails, the workflow doesn’t give up and doesn’t guess. It retries, and conditional routing
          decides where the document goes next.
        </p>
      </section>

      <section>
        <h2>Keeping it honest</h2>
        <p>
          A model that’s confidently wrong is worse than a slow human. Across the platform’s AI features, I kept
          generation reliable in production:
        </p>
        <ul>
          <li>Model output is checked against a schema before anything uses it.</li>
          <li>Malformed output gets a retry, then a fallback path, never a crash.</li>
          <li>Every prompt change is regression-tested against a curated eval set before it ships.</li>
        </ul>
      </section>

      <section>
        <h2>Around it</h2>
        <p>
          The agent sits inside a bigger platform I also worked on. A multimodal generation service (OpenAI for product
          copy, Stable Diffusion for images) cut product listing time by 40%. The multi-seller storefront itself (Next.js,
          Tailwind, REST APIs) got stores to market 30% faster, with CI/CD in GitHub Actions that halved deployment cycles
          at zero downtime.
        </p>
      </section>

      <p className="case-note">This is work for an employer, so the code, data and internal details stay private.</p>
    </main>
  );
}
