import { EMAIL, GITHUB, LINKEDIN } from "@/content/site";

// What each object on the desk says. Facts come only from the résumé and
// from Rohan; no employer name, no phone number.

export type Link = { label: string; href: string; external?: boolean };
export type Panel = { kicker: string; title: string; body: string[]; list?: string[]; links?: Link[] };

/** Career steps, oldest first. */
export const HISTORY = [
  { date: "2018 – 2022", text: "B.Tech in Information Technology, Maharaja Agrasen Institute of Technology, Delhi" },
  { date: "2021", text: "SDE intern, Container Corporation of India: a handwriting model that runs offline, with a person checking the 15% it was least sure of" },
  { date: "2021 – 2022", text: "Software engineer, Let's Dunch (remote, Dubai): a “who to meet” recommender, and 30% more sign-ups after a redesign I led with a team of three" },
  { date: "2022 – 2024", text: "M.S. in Human-Computer Interaction, Purdue University" },
  { date: "2024", text: "Value Imprint published at NeurIPS 2024" },
  { date: "2024 – now", text: "Software engineer at my day job (remote, New York): AI agents, the guardrails that keep them honest, and the platform around them" },
];

/** Skills, grouped. */
export const SKILLS = [
  { group: "AI and LLM ops", items: "LangGraph agents, MCP servers, RAG, embeddings, evals, guardrails, LoRA/PEFT; Claude, GPT-4o and Gemini APIs" },
  { group: "Web", items: "React, Next.js, Tailwind, Node.js, FastAPI, Spring Boot, .NET" },
  { group: "Data and infra", items: "PostgreSQL, MongoDB, Qdrant, Redis, Docker, GitHub Actions, Azure DevOps" },
  { group: "Languages", items: "Python, JavaScript, Java, C++, C#, SQL, Dart, Kotlin" },
];

/** Short labels shown on hover. */
export const LABELS: Record<string, string> = {
  monitor: "Open the computer",
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
      "These days I build AI agents that do real work, and the evals and guardrails that stop them making things up.",
    ],
  },
  keyboard: {
    kicker: "Keyboard",
    title: "What I type with",
    body: [],
    list: SKILLS.map((skill) => `${skill.group}: ${skill.items}`),
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
    list: HISTORY.map((step) => `${step.date}: ${step.text}`),
  },
};
