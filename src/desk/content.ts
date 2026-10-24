import { EMAIL, GITHUB, LINKEDIN } from "@/content/site";

// What each object on the desk says. Facts come only from the résumé and
// from Rohan; no employer name, no phone number.

export type Link = { label: string; href: string; external?: boolean };
export type Panel = { kicker: string; title: string; body: string[]; list?: string[]; links?: Link[] };

/** Short labels shown on hover. */
export const LABELS: Record<string, string> = {
  monitor: "The computer · open it",
  sticky: "Say hi",
  photo: "That's me",
  keyboard: "Skills",
  controller: "Currently playing",
  clipboard: "Résumé",
  tickets: "How I got here",
  plant: "A plant",
};

export const PANELS: Record<string, Panel> = {
  sticky: {
    kicker: "Sticky note",
    title: "Say hi",
    body: ["Open to full-stack and AI engineering roles. Based in Delhi, happy to relocate, can start right away."],
    links: [
      { label: EMAIL, href: `mailto:${EMAIL}` },
      { label: "LinkedIn", href: LINKEDIN, external: true },
      { label: "GitHub", href: GITHUB, external: true },
    ],
  },
  photo: {
    kicker: "Photo frame",
    title: "That's me, in Chicago",
    body: [
      "I'm Rohan. I'm a full-stack and AI engineer with 3+ years of building things people use, and an M.S. in Human-Computer Interaction from Purdue.",
      "These days I build AI agents that do real work, and the evals and guardrails that keep them honest.",
    ],
  },
  keyboard: {
    kicker: "Keyboard",
    title: "What I type with",
    body: [],
    list: [
      "AI & LLM ops: LangGraph agents, MCP servers, RAG, embeddings, evals, guardrails, LoRA/PEFT",
      "LLM APIs: Claude, GPT-4o, Gemini",
      "Web: React, Next.js, Tailwind, Node.js, FastAPI, Spring Boot, .NET",
      "Data & infra: PostgreSQL, MongoDB, Qdrant, Redis, Docker, GitHub Actions, Azure DevOps",
      "Languages: Python, JavaScript, Java, C++, C#, SQL, Dart, Kotlin",
    ],
  },
  controller: {
    kicker: "Controller",
    title: "Currently: losing to Hades",
    body: ["Steam, mostly. Roguelikes taught me what agents should do: fail, learn something, try again."],
  },
  clipboard: {
    kicker: "Clipboard",
    title: "Résumé",
    body: ["The short version is on LinkedIn, and I'm happy to send the full one."],
    links: [
      { label: "LinkedIn", href: LINKEDIN, external: true },
      { label: "Ask for the PDF", href: `mailto:${EMAIL}?subject=Your%20r%C3%A9sum%C3%A9` },
    ],
  },
  tickets: {
    kicker: "Boarding passes",
    title: "How I got here",
    body: [],
    list: [
      "2018 – 2022 · B.Tech in IT, Maharaja Agrasen Institute of Technology, Delhi",
      "2021 · SDE intern, Container Corporation of India: an offline handwriting model, with a human checking the unsure 15%",
      "2021 – 2022 · Software engineer, Let's Dunch (remote, Dubai): a recommender, and +30% registrations",
      "2022 – 2024 · M.S. in Human-Computer Interaction, Purdue University",
      "2024 · NeurIPS 2024: Value Imprint",
      "2024 – now · Software engineer at my day job: AI agents, guardrails and the platform around them",
    ],
  },
};
