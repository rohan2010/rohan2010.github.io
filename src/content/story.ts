import { existsSync } from "node:fs";
import { join } from "node:path";

// Every string on the page lives here (plan, section 2). Facts come only from
// docs/RP_resume_developer.pdf and the plan. No phone number, ever.

export interface Link {
  label: string;
  href: string;
  external?: boolean;
}

// The résumé button appears only once Rohan's phone-free copy is at
// public/rohan-pant-resume.pdf. Never copy the PDF from docs/.
const RESUME_FILE = "rohan-pant-resume.pdf";
export const RESUME_READY = existsSync(join(process.cwd(), "public", RESUME_FILE));
export const RESUME_HREF = `/${RESUME_FILE}`;

export const EMAIL = "rohanpant.work@gmail.com";
export const LINKEDIN = "https://www.linkedin.com/in/rohan-pant/";
export const GITHUB = "https://github.com/rohan2010";

export const site = {
  name: "Rohan Pant",
  title: "Rohan Pant · Full-stack + AI engineer",
  description:
    "Rohan Pant makes AI models dependable in production: agent workflows, guardrails, evals and the platform they ship on.",
  url: "https://rohan2010.github.io",
};

export interface Chapter {
  id: "field" | "research" | "work" | "fun";
  n: string;
  word: string;
  years: string;
}

/** The four chapters, in reading (and chronological) order. The rail and the openers use these. */
export const chapters: Chapter[] = [
  { id: "field", n: "01", word: "Field", years: "2021" },
  { id: "research", n: "02", word: "Research", years: "2022–24" },
  { id: "work", n: "03", word: "Work", years: "2024–now" },
  { id: "fun", n: "04", word: "For fun", years: "now" },
];

export const contactLink: Link = { label: "Contact", href: "#contact" };
export const menuLabel = "Menu";
export const skipLabel = "Skip to content";

export const resumeLabels = {
  top: "Résumé ↓",
  hero: "Download résumé",
  contact: "Résumé (PDF) ↓",
};

export const hero = {
  eyebrow: "Rohan Pant · Full-stack + AI engineer",
  title: "I make AI models dependable.",
  lead: "Full-stack engineer at BulkMagic, building agent workflows and the guardrails, evals and platform that let them ship. The bench is that loop: swap the model, check the output, ship.",
  primary: { label: "See the work", href: "#field" } satisfies Link,
  facts: ["BulkMagic · 2024–now", "Purdue M.S. HCI", "NeurIPS 2024"],
};

export interface TimelineEntry {
  org: string;
  role: string;
  place: string;
  dates: string;
  /** the entry's one key fact, set large above the body */
  keyFact: string;
  body: string;
  chips: string[];
}

export const field = {
  title: "First models, out where people use them.",
  entries: [
    {
      org: "Container Corporation of India Ltd.",
      role: "SDE Intern",
      place: "New Delhi",
      dates: "Sep–Nov 2021",
      body: "Trained an edge-optimized CNN in TensorFlow to read handwritten digits and shipped it with TFLite inside a cross-platform Flutter app, so on-site operations didn't depend on cloud compute. Then built an active-learning loop against concept drift: the 15% of predictions the model was least sure of went to a person, and the verified labels retrained it.",
      keyFact: "bottom 15% → human review",
      chips: ["offline inference"],
    },
    {
      org: "Let's Dunch",
      role: "Software Engineer",
      place: "Dubai (remote)",
      dates: "Aug 2021–Feb 2022",
      body: "Built a “Who to Meet” recommendation pipeline in Python and scikit-learn. It turned user metadata into similarity scores and corrected itself from an implicit feedback loop on interaction data, which lifted retention. Led a 3-person team through a full-stack redesign of the event booking flow: registrations rose 30%.",
      keyFact: "+30% registrations",
      chips: [],
    },
  ] satisfies TimelineEntry[],
};

export const research = {
  title: "Then I asked what the models were being taught.",
  lead: "M.S. in Human-Computer Interaction, Purdue University, Aug 2022–May 2024.",
  card: {
    name: "Value Imprint",
    kind: "an RLHF dataset auditing framework",
    badge: "NeurIPS 2024",
    body: [
      "A two-phase NLP pipeline that maps an ethics-based taxonomy onto 6,501 curated RLHF annotations.",
      "A transformer classifier trained on it audits industry alignment data, and found a statistical bias toward information-utility over prosocial values. The datasets are open-sourced.",
    ],
    datasetsLabel: "Audited",
    datasets: ["Anthropic/hh-rlhf", "OpenAI WebGPT", "Alpaca GPT-4"],
    chips: ["Python", "Transformers", "NLP"],
    stat: "6,501",
    statLabel: "RLHF annotations audited",
    // Open question 4: the paper URL. Hidden until Rohan sends it.
    paper: null as Link | null,
  },
};

export const work = {
  title: "Now I make them dependable in production.",
  role: { org: "BulkMagic, Inc", title: "Software Engineer", place: "New York (remote)", dates: "Aug 2024–present" },
  rows: [
    {
      label: "Seller activation",
      metric: "days → minutes",
      body: "Seller activation, via a stateful LangGraph agent workflow whose tool-calling nodes validate KYC, tax and legal documents, with conditional routing and retries on failure.",
    },
    {
      label: "Product listing time",
      metric: "−40%",
      body: "Product listing time, via a multimodal generation service (OpenAI API for product copy, Stable Diffusion for imagery) built on versioned prompt templates and structured-output parsing.",
    },
    {
      label: "Output guardrails",
      metric: "retry · fallback · evals",
      small: true,
      body: "Generation kept reliable in production: schema validation on model responses, retry and fallback paths for malformed output, and prompt changes regression-tested against a curated eval set.",
    },
    {
      label: "Storefront time-to-market",
      metric: "−30%",
      body: "Storefront time-to-market, by building the multi-seller platform (Next.js, Tailwind CSS, REST APIs). CI/CD automated with GitHub Actions halved deployment cycles, with zero downtime.",
    },
  ],
  callback: { label: "↑ The bench runs this loop: seat a model, check the output, retry, ship.", href: "#top" } satisfies Link,
  toolboxTitle: "Toolbox",
  // The résumé's own skills, grouped by job, duplicates merged (design pass, 7.1).
  // The first three of each list are set in ink, the rest in ink-2.
  toolbox: [
    { label: "Ship AI features", items: ["LLM APIs (Claude, GPT-4o, Gemini)", "LangGraph agents", "MCP servers", "RAG pipelines", "embeddings", "vector search", "prompt versioning", "LLM evals", "guardrails", "LoRA/PEFT fine-tuning"] },
    { label: "Build the product", items: ["Next.js", "React.js", "Tailwind CSS", "Node.js", "FastAPI", "Spring Boot", ".NET"] },
    { label: "Run it", items: ["PostgreSQL", "MySQL", "MongoDB", "Qdrant", "Redis", "Docker", "GitHub Actions (CI/CD)", "Azure DevOps"] },
    { label: "Languages & ML", items: ["Python", "JavaScript", "Java", "C++", "C#", "SQL", "Dart", "Kotlin", "PyTorch", "TensorFlow"] },
  ],
};

export const fun = {
  title: "The bench is real. I swap models for fun.",
  lead: "When a new model comes out, I put it on the same task as the others and see what changes. To make that easy I built DecentralMem.AI, so one memory travels with me from model to model.",
  memory: {
    name: "DecentralMem.AI",
    kind: "a model-agnostic persistent memory layer",
    body: "MAML is a retrieval-augmented context layer that serves project-scoped memory to Claude, GPT-4o, Gemini and local LLMs through an MCP server interface, with namespace isolation and retries when the vector store fails. PostgreSQL is the source of truth, Qdrant does vector search and Redis caches, with embeddings from a self-hosted FastAPI service.",
    stackLabel: "Stack",
    // Each part's job, word for word from the résumé.
    stack: [
      { name: "PostgreSQL", role: "source of truth" },
      { name: "Qdrant", role: "vector search" },
      { name: "Redis", role: "cache" },
      { name: "FastAPI", role: "self-hosted embeddings" },
      { name: "MCP", role: "serves Claude, GPT-4o, Gemini, local LLMs" },
    ],
    // Open question 5: repo or demo link. Hidden until Rohan sends it.
    code: null as Link | null,
  },
  notebookTitle: "Lab notebook",
  notebookLead: "Experiments I run on the bench, newest first.",
  notebookFields: { question: "Question", models: "Models on the bench", noticed: "What I noticed" },
  shelfTitle: "From the workbench",
  shelfLead: "Side projects on GitHub, newest first.",
  codeLabel: "Code ↗",
  liveLabel: "Live ↗",
  more: { label: "More on GitHub ↗", href: GITHUB, external: true } satisfies Link,
};

export const newTab = "(opens in a new tab)";

export const contact = {
  eyebrow: "Contact",
  title: "Building something with models in it? Let's talk.",
  linkedin: { label: "LinkedIn ↗", href: LINKEDIN, external: true } satisfies Link,
  github: { label: "github.com/rohan2010 ↗", href: GITHUB, external: true } satisfies Link,
  location: "Delhi · open to relocating · immediate joiner",
  education: "M.S. in Human-Computer Interaction, Purdue University, 2022–24 · B.Tech in Information Technology, Maharaja Agrasen Institute of Technology, 2018–22",
  footer: "© 2026 Rohan Pant · Built with Next.js, drawn with Anatomy.",
};
