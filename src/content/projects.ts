// The GitHub shelf (plan, section 2.5b). Written by hand at build time; no
// GitHub API calls at runtime. Every claim here comes from the repo's own
// README (read in full on 2026-10-22) or its description. Nothing claims a
// result, status or publication the README doesn't state.

export interface Project {
  name: string;
  repo: string;
  hook: string;
  body: string;
  /** a status the README states, shown as a tag */
  status?: string;
  /** one honest line under the status, when needed */
  note?: string;
  chips: string[];
  code: string;
  live?: string;
}

export const projects: Project[] = [
  {
    name: "bloomScroll",
    repo: "bloomScroll",
    hook: "Keeps YouTube on what you came for.",
    body: "A free, open-source browser extension that removes off-topic videos from your YouTube feed. Each title runs through a cascade: rules first, then MiniLM embeddings on your device, then an optional local model for the unclear few. It runs on your own computer, with no account and no tracking.",
    status: "Early release",
    chips: ["TypeScript", "Transformers.js", "MiniLM", "local LLM"],
    code: "https://github.com/rohan2010/bloomScroll",
  },
  {
    name: "BharatEdge-Eval",
    repo: "bharat-edge",
    hook: "Does shrinking a small model to fit a budget phone hurt Hindi and Hinglish users more than English users, and can a cheap fix recover it?",
    body: "The plan: quantize sub-2B models with llama.cpp, from BF16 down to 3-bit builds, and measure how much Hindi, romanized Hinglish and Bengali lose next to English on reading comprehension, generation and safety. Then test whether multilingual calibration recovers the gap at no inference cost.",
    status: "Independent research · Paper in preparation",
    note: "Unpublished for now: the write-up is on its way.",
    chips: ["Python", "llama.cpp", "GGUF", "quantization"],
    code: "https://github.com/rohan2010/bharat-edge",
  },
  {
    name: "Conductor",
    repo: "strata_dev",
    hook: "Describe a goal; it plans the work, delegates to specialists and hands you a pull request.",
    body: "A generalist orchestrator turns the goal into a typed task graph and routes each task to a specialist subagent with its own prompt, model, allow-listed tools and isolated conversation. Only a structured summary comes back, and model choice lives in one routing file with fallbacks across providers.",
    status: "Phase 0 spike",
    note: "Exercised end to end against scripted model responses; no live run yet.",
    chips: ["Python", "LangGraph", "Pydantic", "Typer"],
    code: "https://github.com/rohan2010/strata_dev",
  },
  {
    name: "NoteNinja",
    repo: "NoteNinja",
    hook: "Turns a song into another genre with a diffusion model.",
    body: "A diffusion model trained on GTZAN spectrograms across ten genres. Audio is encoded into a latent space, and decoding from there gives a spectrogram that turns back into audio in the genre you picked. Sharper spectrograms, for cleaner audio, were the next step.",
    status: "2023",
    chips: ["Python", "Jupyter", "diffusion", "spectrograms"],
    code: "https://github.com/rohan2010/NoteNinja",
  },
];

export interface NotebookEntry {
  date: string;
  title: string;
  status: string;
  note: string;
  question: string;
  /** models on the bench, each drawn as a cartridge tag */
  models: string[];
  noticed: string;
  link?: { label: string; href: string };
}

// Lab notebook (plan, L1). Only real entries; more once Rohan sends them.
export const notebook: NotebookEntry[] = [
  {
    date: "Oct 2026",
    title: "BharatEdge-Eval",
    status: "Independent research · Paper in preparation",
    note: "Unpublished for now: the write-up is on its way.",
    question:
      "Does shrinking a small language model to fit a budget phone hurt Hindi, Hinglish and other Indic users more than English users? And can a cheap fix recover what they lose?",
    models: ["Gemma 3 1B IT", "Qwen3 1.7B", "Llama 3.2 1B Instruct", "Qwen3 0.6B"],
    noticed: "In progress. Setup is done: all four BF16 models answer in English and Hindi. Quantizing the builds comes next.",
    link: { label: "Code on GitHub ↗", href: "https://github.com/rohan2010/bharat-edge" },
  },
];
