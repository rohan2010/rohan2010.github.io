import type { Source } from "./schema";

// Every history claim on the site, with one checked source (MASTER §2, truth
// rules; concepts.md "Fact checks"). State a claim only as written in `claim`,
// and read `note` first. Checked by web search on 2026-10-22.
// To add a fact: add an entry, verify it, and cite its id from your content.

const CHECKED = "2026-10-22";

export const sources = [
  {
    id: "lovelace-note-g",
    claim: "In Note G (1843), Ada Lovelace wrote of the Analytical Engine: “It can do whatever we know how to order it to perform.”",
    source: "A. A. L. (Ada Lovelace), Notes to the translation of L. F. Menabrea, “Sketch of the Analytical Engine”, Taylor’s Scientific Memoirs, vol. 3, 1843, Note G",
    url: "https://www.fourmilab.ch/babbage/sketch.html",
    verified: true,
    checked: CHECKED,
    note: "Quote exactly, without “only” (a common misquotation). The sentence before it: “The Analytical Engine has no pretensions whatever to originate any thing.” Turing (1950) called this “Lady Lovelace’s Objection”.",
  },
  {
    id: "hollerith-1890-census",
    claim: "Herman Hollerith’s electric tabulating system, using punched cards, was adopted by the US Census Bureau for the 1890 census.",
    source: "IEEE Computer Society, “Herman Hollerith”; Wikipedia, “Tabulating machine”",
    url: "https://history.computer.org/hollerith.html",
    verified: true,
    checked: CHECKED,
    note: "The system had a punch, a tabulator and a sorting box. Avoid exact speed-up figures unless you add a source for them.",
  },
  {
    id: "tmc-to-ibm-1924",
    claim: "Hollerith founded the Tabulating Machine Company in 1896; it merged into the Computing-Tabulating-Recording Company in 1911, which was renamed IBM in 1924.",
    source: "Wikipedia, “Herman Hollerith”",
    url: "https://en.wikipedia.org/wiki/Herman_Hollerith",
    verified: true,
    checked: CHECKED,
    note: "Do not say “the Tabulating Machine Company became IBM in 1924” without the 1911 CTR step; say “Hollerith’s company is one root of IBM (named in 1924)”.",
  },
  {
    id: "lecun-1989-zip",
    claim: "In 1989 LeCun and colleagues at AT&T Bell Labs trained a convolutional network by backpropagation to read handwritten ZIP code digits supplied by the US Postal Service.",
    source: "Y. LeCun et al., “Backpropagation Applied to Handwritten Zip Code Recognition”, Neural Computation 1(4):541–551, 1989",
    url: "https://doi.org/10.1162/neco.1989.1.4.541",
    verified: true,
    checked: CHECKED,
    note: "The network is commonly called an early LeNet. The USPS supplied the digits; do not say the USPS deployed this network in 1989.",
  },
  {
    id: "tapestry-1992",
    claim: "In 1992 researchers at Xerox PARC described Tapestry, an email filtering system built on “collaborative filtering”: people annotate documents and others filter by those annotations.",
    source: "D. Goldberg, D. Nichols, B. M. Oki, D. Terry, “Using Collaborative Filtering to Weave an Information Tapestry”, Communications of the ACM 35(12):61–70, Dec 1992",
    url: "https://doi.org/10.1145/138859.138867",
    verified: true,
    checked: CHECKED,
    note: "That the paper COINED the term is widely credited by surveys, but no primary source confirming the coinage was found. Prefer “named” or “described”; if the page says “coined”, cite it as “usually credited with coining the term”.",
  },
  {
    id: "transformer-2017",
    claim: "In 2017 Vaswani et al. introduced the Transformer, a network architecture based only on attention.",
    source: "A. Vaswani et al., “Attention Is All You Need”, arXiv:1706.03762, June 2017 (NeurIPS 2017)",
    url: "https://arxiv.org/abs/1706.03762",
    verified: true,
    checked: CHECKED,
  },
  {
    id: "rlhf-christiano-2017",
    claim: "In 2017 Christiano et al. showed agents could learn goals from human preferences between pairs of behaviours, the basis of RLHF.",
    source: "P. Christiano et al., “Deep Reinforcement Learning from Human Preferences”, arXiv:1706.03741, June 2017",
    url: "https://arxiv.org/abs/1706.03741",
    verified: true,
    checked: CHECKED,
  },
  {
    id: "instructgpt-2022",
    claim: "In 2022 OpenAI’s InstructGPT fine-tuned GPT-3 with reinforcement learning from human feedback, and people preferred its outputs to those of a model 100 times larger.",
    source: "L. Ouyang et al., “Training language models to follow instructions with human feedback”, arXiv:2203.02155, March 2022",
    url: "https://arxiv.org/abs/2203.02155",
    verified: true,
    checked: CHECKED,
    note: "The 1.3B InstructGPT model was preferred to the 175B GPT-3.",
  },
  {
    id: "react-2022",
    claim: "In October 2022 ReAct had language models interleave reasoning with actions, such as calling a Wikipedia API.",
    source: "S. Yao et al., “ReAct: Synergizing Reasoning and Acting in Language Models”, arXiv:2210.03629, Oct 2022 (ICLR 2023)",
    url: "https://arxiv.org/abs/2210.03629",
    verified: true,
    checked: CHECKED,
  },
  {
    id: "toolformer-2023",
    claim: "In February 2023 Toolformer taught a language model, self-supervised, to decide which APIs to call, when, and with what arguments.",
    source: "T. Schick et al., “Toolformer: Language Models Can Teach Themselves to Use Tools”, arXiv:2302.04761, Feb 2023",
    url: "https://arxiv.org/abs/2302.04761",
    verified: true,
    checked: CHECKED,
  },
  {
    id: "mcp-2024",
    claim: "On 25 November 2024 Anthropic introduced the Model Context Protocol (MCP), an open standard for connecting AI assistants to the systems where data lives.",
    source: "Anthropic, “Introducing the Model Context Protocol”, 25 Nov 2024",
    url: "https://www.anthropic.com/news/model-context-protocol",
    verified: true,
    checked: CHECKED,
  },
] as const satisfies readonly Source[];

export type SourceId = (typeof sources)[number]["id"];

export const sourceById = (id: SourceId): Source => sources.find((s) => s.id === id)!;
