// Home page content. Facts come only from docs/RP_resume_developer.pdf and the
// project repos. No phone number, ever.

export type Stop = {
  year: string;
  when: string;
  where: string;
  role: string;
  text: string;
  stat?: { value: string; label: string };
  tags: string[];
};

export const timeline: Stop[] = [
  {
    year: "2018",
    when: "2018 – 2022",
    where: "Maharaja Agrasen Institute of Technology",
    role: "B.Tech, Information Technology",
    text: "Delhi. Learned to build things end to end, and that I mostly liked the parts where software meets people.",
    tags: ["Java", "C++", "SQL"],
  },
  {
    year: "2021",
    when: "Aug 2021 – Feb 2022",
    where: "Let’s Dunch · Dubai (remote)",
    role: "Software Engineer",
    text: "Built a “Who to Meet” recommender that turned user metadata into similarity scores and corrected itself from what people actually clicked. Led a 3-person redesign of event booking.",
    stat: { value: "+30%", label: "registrations" },
    tags: ["Python", "scikit-learn", "React"],
  },
  {
    year: "2021",
    when: "Sep – Nov 2021",
    where: "Container Corporation of India",
    role: "SDE Intern",
    text: "Trained a small CNN to read handwritten digits offline, inside a Flutter app on site. The least-confident 15% went to a human, and the model retrained on their answers.",
    stat: { value: "0", label: "cloud calls needed" },
    tags: ["TensorFlow", "TFLite", "Flutter"],
  },
  {
    year: "2022",
    when: "Aug 2022 – May 2024",
    where: "Purdue University",
    role: "M.S., Human-Computer Interaction",
    text: "Moved to the US to study how people and models work together, and started asking what AI systems are actually taught.",
    tags: ["HCI", "NLP", "Research"],
  },
  {
    year: "2024",
    when: "NeurIPS 2024",
    where: "Value Imprint · published",
    role: "Co-author",
    text: "Audited the RLHF data used to align real models (Anthropic hh-rlhf, OpenAI WebGPT, Alpaca GPT-4). It leaned toward being useful over being prosocial.",
    stat: { value: "6,501", label: "annotations audited" },
    tags: ["Transformers", "RLHF", "Datasets"],
  },
  {
    year: "2024",
    when: "Aug 2024 – now",
    where: "BulkMagic, Inc · New York (remote)",
    role: "Software Engineer",
    text: "Shipped a LangGraph agent that checks sellers’ KYC, tax and legal documents itself, with guardrails, retries and an eval set behind every prompt change.",
    stat: { value: "days → min", label: "seller activation" },
    tags: ["LangGraph", "Next.js", "Evals"],
  },
  {
    year: "Now",
    when: "2026",
    where: "Open source",
    role: "Building",
    text: "DecentralMem: one memory layer any model can read over MCP. bloomScroll: a YouTube feed filter that runs entirely on your own machine.",
    tags: ["MCP", "Qdrant", "On-device"],
  },
];

export type Project = {
  name: string;
  kind: string;
  line: string;
  stat: string;
  statLabel: string;
  stack: string[];
  href?: string;
  linkLabel?: string;
};

export const projects: Project[] = [
  {
    name: "Seller onboarding agent",
    kind: "BulkMagic · production",
    line: "A stateful agent reads KYC, tax and legal documents, routes on what it finds and retries on failure. Generation is checked against schemas and an eval set before it ships.",
    stat: "−40%",
    statLabel: "product listing time",
    stack: ["LangGraph", "OpenAI", "Guardrails"],
  },
  {
    name: "Value Imprint",
    kind: "NeurIPS 2024 · research",
    line: "A framework to audit which human values are baked into RLHF datasets, from an ethics taxonomy to a trained classifier.",
    stat: "6,501",
    statLabel: "annotations",
    stack: ["Python", "Transformers"],
  },
  {
    name: "DecentralMem.AI",
    kind: "Memory layer · in progress",
    line: "Project-scoped memory served over MCP. Postgres is the source of truth, Qdrant does search, Redis caches. The Claude adapter runs today; others are next.",
    stat: "MCP",
    statLabel: "model-agnostic",
    stack: ["FastAPI", "Postgres", "Qdrant", "Redis"],
  },
  {
    name: "bloomScroll",
    kind: "Browser extension · open source",
    line: "Hides off-topic YouTube videos using rules, then on-device embeddings, then an optional local model. Nothing you watch leaves your computer.",
    stat: "39s → 2.7s",
    statLabel: "40-title feed, measured",
    stack: ["TypeScript", "MiniLM", "Local LLM"],
    href: "/work/bloomscroll/",
    linkLabel: "Read the case study",
  },
];
