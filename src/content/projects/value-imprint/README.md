# Value Imprint

Before a model is aligned with "human preferences", whose values are actually in that data?

Value Imprint is a way to find out. It runs in two phases:

1. **By hand.** A taxonomy of seven human values, built from the ethics literature, was used to label **6,501 preferences** from Anthropic's hh-rlhf. Five annotators agreed at 0.85 (Krippendorff's alpha).
2. **By model.** A RoBERTa classifier trained on those labels then labelled three alignment datasets in full: hh-rlhf, OpenAI WebGPT Comparisons and Alpaca GPT-4-LLM. A human check of 500 of its outputs found it right 84% of the time.

**What we found:** Wisdom & Knowledge was the most common value in all three datasets (up to 78.17% in WebGPT). Justice & Human/Animal Rights was the least common in all three (0.04% to 1.76%).

Published at NeurIPS 2024 in the Datasets & Benchmarks track, as a spotlight poster. First author Ike Obi. I'm second of five authors, with Srishti Shekhar Agrawal, Maham Ghazanfar and Aaron Basiletti.

The paper is on arXiv: 2411.11937. The labelled datasets are at github.com/hv-rsrch/valueimprint (CC BY 4.0).
